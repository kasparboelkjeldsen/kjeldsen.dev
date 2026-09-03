using kjeldsen.backend.code.services.Background;
using kjeldsen.backend.code.settings;
using Kraftvaerk.Umbraco.Headless.CacheKeys.Backend.Services.CacheDependencySolver;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;

namespace kjeldsen.backend.code.notifications.ContentSaved;

/// <summary>
/// On unpublish and on a move to the recycle bin, tells the Nuxt frontend which cache tags to
/// drop - the same call the publish handler makes, for the same reason: a page that has just
/// gone away must not keep being served from the frontend's query cache until its TTL runs out.
///
/// Deleting published content raises the unpublish notification first, so the recycle-bin
/// handler mostly matters for documents whose children were published.
/// </summary>
public class ContentUnpublishedCacheKeyLogger :
    INotificationAsyncHandler<ContentUnpublishedNotification>,
    INotificationAsyncHandler<ContentMovedToRecycleBinNotification>
{
    private readonly ICacheKeyDependencyResolver _resolver;
    private readonly IBackgroundTaskQueue _taskQueue;
    private readonly NuxtCacheInvalidator _invalidator;

    public ContentUnpublishedCacheKeyLogger(
        ICacheKeyDependencyResolver resolver,
        IOptions<NuxtSettings> nuxtSettings,
        IHttpClientFactory httpClientFactory,
        ILogger<ContentUnpublishedCacheKeyLogger> logger,
        IBackgroundTaskQueue taskQueue)
    {
        _resolver = resolver;
        _taskQueue = taskQueue;
        _invalidator = new NuxtCacheInvalidator(nuxtSettings.Value, httpClientFactory.CreateClient(), logger);
    }

    public Task HandleAsync(ContentUnpublishedNotification notification, CancellationToken cancellationToken)
    {
        Queue(notification.UnpublishedEntities.SelectMany(content => _resolver.GetDependencies(content)));
        return Task.CompletedTask;
    }

    public Task HandleAsync(ContentMovedToRecycleBinNotification notification, CancellationToken cancellationToken)
    {
        Queue(notification.MoveInfoCollection.SelectMany(m => _resolver.GetDependencies(m.Entity)));
        return Task.CompletedTask;
    }

    private void Queue(IEnumerable<string> keys)
    {
        var tags = keys.ToHashSet();
        if (tags.Count == 0) return;

        // Fire-and-forget: the editor's action must not wait on the frontend answering.
        _taskQueue.QueueBackgroundWorkItem(_ => _invalidator.InvalidateAsync(tags));
    }
}

/// <summary>
/// The one call to the frontend's purge endpoint, shared by the publish and unpublish handlers.
/// The URL and header are the ones the frontend has always accepted; it is the frontend's own
/// cache behind them that changed between V1 and V2.
/// </summary>
public sealed class NuxtCacheInvalidator
{
    private readonly string _host;
    private readonly string _apiKey;
    private readonly HttpClient _httpClient;
    private readonly ILogger _logger;

    public NuxtCacheInvalidator(NuxtSettings settings, HttpClient httpClient, ILogger logger)
    {
        _host = settings.Host.TrimEnd('/');
        _apiKey = settings.ApiKey;
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task InvalidateAsync(IEnumerable<string> tags)
    {
        var list = tags.ToArray();
        var request = new StringContent(System.Text.Json.JsonSerializer.Serialize(list), System.Text.Encoding.UTF8, "application/json");
        request.Headers.Add("x-nuxt-multi-cache-token", _apiKey);

        try
        {
            var response = await _httpClient.PostAsync($"{_host}/__nuxt_multi_cache/purge/tags", request);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Nuxt cache invalidation failed: {StatusCode} - {Reason}", response.StatusCode, response.ReasonPhrase);
            }
            else
            {
                _logger.LogInformation("Nuxt cache invalidation triggered for tags: {Tags}", string.Join(", ", list));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Nuxt cache invalidation endpoint");
        }
    }
}
