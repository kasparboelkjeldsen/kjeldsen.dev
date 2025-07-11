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

    public ContentPublishedCacheKeyLogger(
        ICacheKeyDependencyResolver resolver,
        IOptions<NuxtSettings> nuxtSettings,
        IHttpClientFactory httpClientFactory,
        ILogger<ContentPublishedCacheKeyLogger> logger,
        IConfiguration configuration,
        IUmbracoContextFactory umbracoContextFactory,
        IUmbracoHelperAccessor umbracoHelperAccessor,
        IContentService contentService,
        IScopeProvider scopeProvider)
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

                 urls.Add(umbracoHelper.Content(value));
            }
        }

        if (tags.Count > 0)
        {
            _ = InvalidateFrontendAsync(tags, urls, umbracoHelper); // Fire and forget
        }

        return Task.CompletedTask;
    }

    private async Task InvalidateFrontendAsync(IEnumerable<string> tags, IEnumerable<IPublishedContent> urls, UmbracoHelper umbracoHelper)
    {
        await InvalidateNuxtAsync(tags);
        await InvalidateFrontDoorAsync(urls, umbracoHelper);
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

    private async Task InvalidateFrontDoorAsync(IEnumerable<IPublishedContent> urls, UmbracoHelper umbracoHelper)
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

            List<string> urlStrings = new List<string>();

            foreach (var url in urls)
            {
                if (url.ItemType == PublishedItemType.Content)
                {
                    urlStrings.Add(umbracoHelper.Content(url.Id)?.Url(mode: UrlMode.Relative) ?? string.Empty);
                }
                else if (url.ItemType == PublishedItemType.Media)
                {
                    urlStrings.Add("/api"+umbracoHelper.Media(url.Id)?.Url(mode: UrlMode.Relative) ?? string.Empty);
                }
            }

            var purgeOptions = new FrontDoorPurgeContent(urlStrings);
            
            await endpoint.PurgeContentAsync(WaitUntil.Completed, purgeOptions);

            // poke website
            foreach (var url in urlStrings)
            {
               
                try
                {
                    await _httpClient.GetAsync($"{_nuxtHost}{url}");
                    _logger.LogInformation(url + " is available after purge.");
                }
                catch
                {

                }
            }


            // update lastCdnPurge
            var contentToUpdate = _contentService.GetByIds(urls.Select(x => x.Id));
            contentToUpdate = contentToUpdate.Where(x => x.Properties.Where(p => p.Alias == "lastCdnPurge").Any()).ToList();

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

            _logger.LogInformation("Azure Front Door CDN purge triggered for path: /*");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering Azure Front Door purge");
        }
    }

}
