using kjeldsen.backend.code.services.CacheDependencySolver;
using kjeldsen.backend.code.settings;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace kjeldsen.backend.code.services
{
    public class Services : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            // Bind Nuxt config section from appsettings.json
            builder.Services.Configure<NuxtSettings>(
                builder.Config.GetSection("Nuxt"));

            // Register your dependency resolver
            builder.Services.AddSingleton<ICacheKeyDependencyResolver, CacheKeyDependencyResolver>();
            builder.Services.AddSingleton<IMurderService, MurderService>();
        }
    }
}
