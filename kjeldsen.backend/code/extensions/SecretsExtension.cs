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

        // Local runs boot a blank SQLite database instead (see appsettings.Development.json), so the
        // CMS underneath can be upgraded in isolation. Media, licences and keys still come from Azure.
        var useKeyVaultDatabase = builder.Configuration.GetValue("Azure:UseKeyVaultDatabase", true);

        // Fetch secrets manually
        var blob = secretClient.GetSecret("UmbracoPrimaryStorageKey").Value.Value;
        var storage = $"DefaultEndpointsProtocol=https;AccountName=kjdevstorage;AccountKey={blob};EndpointSuffix=core.windows.net";
        var frontdoor = secretClient.GetSecret("FrontDoorEndpointResourceId").Value.Value;
        var applicationInsights = secretClient.GetSecret("ApplicationInsightsConnectionStringUmbraco").Value.Value;
        var deliveryKey = secretClient.GetSecret("UmbracoDeliveryKey").Value.Value;
        var engageLicense = secretClient.GetSecret("engagelicense").Value.Value;

        if (useKeyVaultDatabase)
        {
            builder.Configuration["ConnectionStrings:umbracoDbDSN"] =
                secretClient.GetSecret("UmbracoSqlConnectionString").Value.Value;
        }

        builder.Configuration["Umbraco:Storage:AzureBlob:Media:ConnectionString"] = storage;
        builder.Configuration["Umbraco:CMS:DeliveryApi:ApiKey"] = deliveryKey;
        builder.Configuration["Nuxt:ApiKey"] = deliveryKey;
        builder.Configuration["HeadlessBlockPreview:ApiKey"] = deliveryKey;
        builder.Configuration["Azure:FrontDoorEndpointResourceId"] = frontdoor;
        builder.Configuration["ApplicationInsights:ConnectionString"] = applicationInsights;
        builder.Configuration["Umbraco:Licenses:Products:Umbraco.Engage"] = engageLicense;
        builder.Configuration["NoteCaptureService:BlobConnectionString"] = storage;
        builder.Configuration["NoteCaptureService:BearerToken"] = deliveryKey;


        return builder;
    }
}
