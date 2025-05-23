using kjeldsen.backend.code.settings;
using Umbraco.Cms.Core.Composing;

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
            builder.Services.AddSingleton<IMurderService, MurderService>();
        }
    }
}
