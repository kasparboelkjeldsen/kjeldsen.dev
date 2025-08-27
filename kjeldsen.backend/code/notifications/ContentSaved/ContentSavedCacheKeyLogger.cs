using Azure.Identity;
using Azure.ResourceManager;
using Azure.ResourceManager.Cdn;
using Azure.ResourceManager.Cdn.Models;
using System.Text;
using kjeldsen.backend.code.settings;
using Kraftvaerk.Umbraco.Headless.CacheKeys.Backend.Services.CacheDependencySolver;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Azure.Core;
using Azure;
using Umbraco.Cms.Web.Common;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Core.Services;
using static Umbraco.Cms.Core.Constants.HttpContext;
using Umbraco.Cms.Infrastructure.Scoping;
using Polly;
using kjeldsen.backend.code.services.Background;

namespace kjeldsen.backend.code.notifications.ContentSaved;

public class ContentPublishedCacheKeyLogger : INotificationAsyncHandler<ContentPublishedNotification>
{
    private readonly ICacheKeyDependencyResolver _resolver;
    private readonly ILogger<ContentPublishedCacheKeyLogger> _logger;
    private readonly string _nuxtHost;
    private readonly string _nuxtApiKey;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly IUmbracoHelperAccessor _umbracoHelperAccessor;
    private readonly IContentService _contentService;
    private readonly IScopeProvider _scopeProvider;
    private readonly IUmbracoContextFactory _umbracoContextFactory;
    private readonly IBackgroundTaskQueue _taskQueue;

    public ContentPublishedCacheKeyLogger(
        ICacheKeyDependencyResolver resolver,
        IOptions<NuxtSettings> nuxtSettings,
        IHttpClientFactory httpClientFactory,
        ILogger<ContentPublishedCacheKeyLogger> logger,
        IConfiguration configuration,
        IUmbracoContextFactory umbracoContextFactory,
        IUmbracoHelperAccessor umbracoHelperAccessor,
        IContentService contentService,
    IScopeProvider scopeProvider,
    IBackgroundTaskQueue taskQueue)
    {
        _resolver = resolver;
        _logger = logger;
        _nuxtHost = nuxtSettings.Value.Host.TrimEnd('/');
        _nuxtApiKey = nuxtSettings.Value.ApiKey;
        _httpClient = httpClientFactory.CreateClient();
        _configuration = configuration;
        _umbracoHelperAccessor = umbracoHelperAccessor;
        _contentService = contentService;
        _scopeProvider = scopeProvider;
    _umbracoContextFactory = umbracoContextFactory;
    _taskQueue = taskQueue;
    }

    public Task HandleAsync(ContentPublishedNotification notification, CancellationToken cancellationToken)
    {
    var tags = new HashSet<string>();
    var urls = new HashSet<IPublishedContent>();
        
        if (!_umbracoHelperAccessor.TryGetUmbracoHelper(out UmbracoHelper? umbracoHelper) || umbracoHelper == null)
        {
            throw new Exception("UmbracoHelper is not available. Ensure UmbracoHelperAccessor is properly configured.");
        }

        if(umbracoHelper == null) throw new Exception("UmbracoHelper is not available. Ensure UmbracoHelperAccessor is properly configured.");

        foreach (var content in notification.PublishedEntities)
        {
            var keys = _resolver.GetDependencies(content);
            foreach (var key in keys)
            {
                tags.Add(key);

                var type = key.Split('-')[0];
                var value = key.Replace(type + "-","");

                if(type == "content")
                {
                    var resolvedContent = umbracoHelper.Content(value);
                    if (resolvedContent != null)
                        urls.Add(resolvedContent);
                }
            }
        }

        if (tags.Count > 0)
        {
            // Pre-calculate URL paths and content IDs to avoid using disposed services later
            var urlPaths = new List<string>();
            var contentIdsForUpdate = new List<int>();

            foreach (var item in urls)
            {
                if (item.ItemType == PublishedItemType.Content)
                {
                    var path = umbracoHelper.Content(item.Id)?.Url(mode: UrlMode.Relative) ?? string.Empty;
                    if (!string.IsNullOrWhiteSpace(path)) urlPaths.Add(path);
                }
                else if (item.ItemType == PublishedItemType.Media)
                {
                    var path = "/api" + (umbracoHelper.Media(item.Id)?.Url(mode: UrlMode.Relative) ?? string.Empty);
                    if (!string.IsNullOrWhiteSpace(path)) urlPaths.Add(path);
                }
                contentIdsForUpdate.Add(item.Id);
            }

            // Enqueue fire-and-forget purge and follow-up work
            _taskQueue.QueueBackgroundWorkItem(ct => InvalidateFrontendAsync(tags.ToArray(), urlPaths.ToArray(), contentIdsForUpdate.ToArray(), ct));
        }

        return Task.CompletedTask;
    }

    private async Task InvalidateFrontendAsync(IEnumerable<string> tags, IEnumerable<string> urlPaths, IEnumerable<int> contentIds, CancellationToken cancellationToken)
    {
        //await InvalidateNuxtAsync(tags);
        await InvalidateFrontDoorAsync(urlPaths, contentIds, cancellationToken);
    }

    private async Task InvalidateNuxtAsync(IEnumerable<string> tags)
    {
        var payload = JsonConvert.SerializeObject(tags);
        var request = new StringContent(payload, Encoding.UTF8, "application/json");
        request.Headers.Add("x-nuxt-multi-cache-token", _nuxtApiKey);

        var url = $"{_nuxtHost}/__nuxt_multi_cache/purge/tags";

        try
        {
            var response = await _httpClient.PostAsync(url, request);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Nuxt cache invalidation failed: {StatusCode} - {Reason}", response.StatusCode, response.ReasonPhrase);
            }
            else
            {
                _logger.LogInformation("Nuxt cache invalidation triggered for tags: {Tags}", string.Join(", ", tags));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Nuxt cache invalidation endpoint");
        }
    }

    private async Task InvalidateFrontDoorAsync(IEnumerable<string> urlPaths, IEnumerable<int> contentIds, CancellationToken cancellationToken)
    {
        try
        {
            var endpointResourceIdRaw = _configuration["Azure:FrontDoorEndpointResourceId"];
            if (string.IsNullOrWhiteSpace(endpointResourceIdRaw))
            {
                _logger.LogWarning("FrontDoorEndpointResourceId is not configured");
                return;
            }

            var resourceId = new ResourceIdentifier(endpointResourceIdRaw);
            var subscriptionId = resourceId.SubscriptionId;

            var credential = new DefaultAzureCredential();
            var armClient = new ArmClient(credential, subscriptionId);

            var endpoint = armClient.GetFrontDoorEndpointResource(resourceId);

            var urlStrings = urlPaths.Distinct().Where(s => !string.IsNullOrWhiteSpace(s)).ToList();
            if (urlStrings.Count == 0)
            {
                _logger.LogInformation("No URL paths to purge.");
            }
            else
            {
                var purgeOptions = new FrontDoorPurgeContent(urlStrings);
                await endpoint.PurgeContentAsync(WaitUntil.Completed, purgeOptions, cancellationToken);
            }

            // poke website
            foreach (var url in urlStrings)
            {

                try
                {
                    var resp = await _httpClient.GetAsync($"{_nuxtHost}{url}", cancellationToken);
                    _logger.LogInformation(url + " is available after purge.");
                }
                catch
                {

                }
            }


            // update lastCdnPurge
            var contentToUpdate = _contentService.GetByIds(contentIds).Where(x => x.Properties.Any(p => p.Alias == "lastCdnPurge")).ToList();

            using (var scope = _scopeProvider.CreateScope(autoComplete: true))
            {
                using (_ = scope.Notifications.Suppress())
                {

                    foreach (var content in contentToUpdate)
                    {
                        if (content != null)
                        {
                            content.SetValue("lastCdnPurge", DateTime.UtcNow);
                            _contentService.Save(content);
                        }
                    }
                }
            }

            _logger.LogInformation("Azure Front Door CDN purge triggered for {Count} paths.", urlStrings.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering Azure Front Door purge");
        }
    }

}
