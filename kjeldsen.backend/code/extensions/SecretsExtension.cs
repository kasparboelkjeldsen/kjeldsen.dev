using Azure.Identity;
using Azure.Security.KeyVault.Secrets;

namespace kjeldsen.backend.code.extensions;

public static class SecretsExtension
{
    public static WebApplicationBuilder AddSecrets(this WebApplicationBuilder builder)
    {
        var vault = builder.Configuration["Azure:KeyVault"];
        var secretClient = new SecretClient(
            new Uri(vault!),
            new DefaultAzureCredential());

        // Fetch secrets manually
        var sql = secretClient.GetSecret("UmbracoSqlConnectionString").Value.Value;
        var blob = secretClient.GetSecret("UmbracoPrimaryStorageKey").Value.Value;
        var storage = $"DefaultEndpointsProtocol=https;AccountName=kjdevstorage;AccountKey={blob};EndpointSuffix=core.windows.net";
        var frontdoor = secretClient.GetSecret("FrontDoorEndpointResourceId").Value.Value;

        var deliveryKey = secretClient.GetSecret("UmbracoDeliveryKey").Value.Value;

        builder.Configuration["ConnectionStrings:umbracoDbDSN"] = sql;
        builder.Configuration["Umbraco:Storage:AzureBlob:Media:ConnectionString"] = storage;
        builder.Configuration["Umbraco:CMS:DeliveryApi:ApiKey"] = deliveryKey;

        builder.Configuration["Nuxt:ApiKey"] = deliveryKey;
        builder.Configuration["HeadlessBlockPreview:ApiKey"] = deliveryKey;
        builder.Configuration["Azure:FrontDoorEndpointResourceId"] = frontdoor;

        return builder;
    }
}
