using System.Text;
using kjeldsen.backend.code.settings;
using Kraftvaerk.Umbraco.Headless.CacheKeys.Backend.Services.CacheDependencySolver;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;

namespace kjeldsen.backend.code.notifications.ContentSaved
{
    public class ContentPublishedCacheKeyLogger : INotificationAsyncHandler<ContentSavedNotification>
    {
        private readonly ICacheKeyDependencyResolver _resolver;
        private readonly ILogger<ContentPublishedCacheKeyLogger> _logger;
        private readonly string _nuxtHost;
        private readonly string _nuxtApiKey;
        private readonly HttpClient _httpClient;

        public ContentPublishedCacheKeyLogger(
            ICacheKeyDependencyResolver resolver,
            IOptions<NuxtSettings> nuxtSettings,
            IHttpClientFactory httpClientFactory,
            ILogger<ContentPublishedCacheKeyLogger> logger)
        {
            _resolver = resolver;
            _logger = logger;
            _nuxtHost = nuxtSettings.Value.Host.TrimEnd('/');
            _nuxtApiKey = nuxtSettings.Value.ApiKey;
            _httpClient = httpClientFactory.CreateClient();
        }

        public async Task HandleAsync(ContentSavedNotification notification, CancellationToken cancellationToken)
        {
            var tags = new HashSet<string>();

            foreach (var content in notification.SavedEntities)
            {
                var keys = _resolver.GetDependencies(content);
                foreach (var key in keys)
                {
                    tags.Add(key);
                }
            }

            if (tags.Count > 0)
            {
                await InvalidateFrontendAsync(tags); // Fire and forget
            }
        }

        private async Task InvalidateFrontendAsync(IEnumerable<string> tags)
        {
            var payload = JsonConvert.SerializeObject(tags);
            var request = new StringContent(payload, Encoding.UTF8, "application/json");

            // Add the API key header here
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
}
