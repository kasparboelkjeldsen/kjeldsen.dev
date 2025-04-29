using kjeldsen.backend.code.delivery.Provider;
using kjeldsen.backend.code.delivery.ResponseBuilder;
using kjeldsen.backend.code.delivery.SchemaFilter;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Community.DeliveryApiExtensions.Swagger;

namespace kjeldsen.backend.code.delivery;

public class Delivery : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Decorate<IApiContentResponseBuilder, CacheKeyDecoratingResponseBuilder>();

        builder.Services.AddTransient<IPostConfigureOptions<SwaggerGenOptions>, RemoveDeliveryApiSchemaFilterPostConfigure>();
        builder.Services.AddSingleton<IApiMediaUrlProvider, AbsolutePathApiUrlProvider>();
    }
}
