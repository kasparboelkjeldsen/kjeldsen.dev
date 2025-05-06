using kjeldsen.backend.code.delivery.Provider;
using kjeldsen.backend.code.delivery.ResponseBuilder;

using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
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

        builder.Services.PostConfigure<SwaggerGenOptions>(options =>
        {
            options.DocumentFilter<CustomSchemaFilter>();
        });
        builder.Services.AddSingleton<IApiMediaUrlProvider, AbsolutePathApiUrlProvider>();
    }
}

public class CustomSchemaFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        foreach ((string schemaId, OpenApiSchema schema) in context.SchemaRepository.Schemas.Where(x => x.Key.InvariantEndsWith("PropertiesModel")))
        {
            schema.Properties["cacheKeys"] = new OpenApiSchema() { Type = "string", Format = "uuid" };
        }
    }
}