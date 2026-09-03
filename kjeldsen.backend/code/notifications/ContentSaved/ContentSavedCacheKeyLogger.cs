using System.Text;
using kjeldsen.backend.code.settings;
using Kraftvaerk.Umbraco.Headless.CacheKeys.Backend.Services.CacheDependencySolver;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using kjeldsen.backend.code.services.Background;

namespace kjeldsen.backend.code.notifications.ContentSaved;

/// <summary>
/// On publish, tells the Nuxt frontend which cache tags to drop.
///
/// The Azure Front Door purge used to run from here too, and wrote a `lastCdnPurge` timestamp back
/// onto the document afterwards. That write was a *draft* save with notifications suppressed, so
/// every publish left the document dirty again a minute or two later - permanent "pending changes"
/// that republishing could never clear. Both the purge and the timestamp property are gone for now;
/// re-add the purge here if Front Door needs it again, but do not store its result on the content.
///
/// It also used an IUmbracoHelper to build those URLs, and threw when one was not available. That
/// made every publish outside a web request fail - a uSync startup import could not publish a
/// single document. Nothing left here needs a request context: resolving cache dependencies and
/// queueing the purge both work from the notification alone.
/// </summary>
public class ContentPublishedCacheKeyLogger : INotificationAsyncHandler<ContentPublishedNotification>
{
    private readonly ICacheKeyDependencyResolver _resolver;
    private readonly ILogger<ContentPublishedCacheKeyLogger> _logger;
    private readonly string _nuxtHost;
    private readonly string _nuxtApiKey;
    private readonly HttpClient _httpClient;
    private readonly IBackgroundTaskQueue _taskQueue;

    public ContentPublishedCacheKeyLogger(
        ICacheKeyDependencyResolver resolver,
        IOptions<NuxtSettings> nuxtSettings,
        IHttpClientFactory httpClientFactory,
        ILogger<ContentPublishedCacheKeyLogger> logger,
        IBackgroundTaskQueue taskQueue)
    {
        _resolver = resolver;
        _logger = logger;
        _nuxtHost = nuxtSettings.Value.Host.TrimEnd('/');
        _nuxtApiKey = nuxtSettings.Value.ApiKey;
        _httpClient = httpClientFactory.CreateClient();
        _taskQueue = taskQueue;
    }

    public Task HandleAsync(ContentPublishedNotification notification, CancellationToken cancellationToken)
    {
        var tags = new HashSet<string>();

        foreach (var content in notification.PublishedEntities)
        {
            foreach (var key in _resolver.GetDependencies(content))
            {
                tags.Add(key);
            }
        }

        if (tags.Count > 0)
        {
            // Fire-and-forget: publishing must not wait on the frontend answering.
            _taskQueue.QueueBackgroundWorkItem(_ => InvalidateNuxtAsync(tags.ToArray()));
        }

        return Task.CompletedTask;
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
}
