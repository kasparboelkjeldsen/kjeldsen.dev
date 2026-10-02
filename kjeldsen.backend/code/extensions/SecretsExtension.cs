using Azure.Identity;
using Azure.Security.KeyVault.Secrets;

namespace kjeldsen.backend.code.extensions;

public static class SecretsExtension
{
    public static WebApplicationBuilder AddSecrets(this WebApplicationBuilder builder)
    {
        var vault = builder.Configuration["Azure:KeyVault"];
        // Locally the managed identity probe (IMDS) times out and fails hard instead of falling
        // through to the Azure CLI / Visual Studio login, so skip it outside Azure.
        var secretClient = new SecretClient(
            new Uri(vault!),
            new DefaultAzureCredential(new DefaultAzureCredentialOptions
            {
                ExcludeManagedIdentityCredential = builder.Environment.IsDevelopment()
            }));

        // Set "Azure:UseKeyVaultDatabase": false to keep a locally configured database, e.g. a
        // throwaway SQLite copy for upgrading the CMS in isolation.
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
