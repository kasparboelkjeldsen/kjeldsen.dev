using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Community.DeliveryApiExtensions.Swagger;

namespace kjeldsen.backend.code.delivery.SchemaFilter;

public class RemoveDeliveryApiSchemaFilterPostConfigure : IPostConfigureOptions<SwaggerGenOptions>
{
    public void PostConfigure(string name, SwaggerGenOptions options)
    {
        var toRemove = options.SchemaFilterDescriptors
            .FirstOrDefault(x => x.Type == typeof(DeliveryApiContentTypesSchemaFilter));
        if (toRemove != null)
        {
            options.SchemaFilterDescriptors.Remove(toRemove);
        }

        var docFilterToRemove = options.DocumentFilterDescriptors
            .FirstOrDefault(x => x.Type == typeof(DeliveryApiContentTypesSchemaFilter));
        if (docFilterToRemove != null)
        {
            options.DocumentFilterDescriptors.Remove(docFilterToRemove);
        }

        // ✅ Re-add your custom derived version here:
        options.SchemaFilter<CustomDeliveryApiContentTypesSchemaFilter>();
        options.DocumentFilter<CustomDeliveryApiContentTypesSchemaFilter>();
    }
}
