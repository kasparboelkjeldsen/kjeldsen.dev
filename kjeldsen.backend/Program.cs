using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using kjeldsen.backend.code.middleware;

var builder = WebApplication.CreateBuilder(args);

// Configure CORS
var allowedOrigins = new[]
{
    "http://localhost",
    "https://localhost",
    "http://localhost:3000",        // Example port, add others as needed
    "https://localhost:3000",
    "https://*.kjeldsen.dev",       // Wildcards are not directly supported in ASP.NET Core CORS, see note below
    "http://*.kjeldsen.dev"
};

var config = builder.Configuration;

var secretClient = new SecretClient(
    new Uri("https://kjdevkv.vault.azure.net/"),
    new DefaultAzureCredential());

// Fetch secrets manually
var sql = secretClient.GetSecret("UmbracoSqlConnectionString").Value.Value;
var blob = secretClient.GetSecret("UmbracoPrimaryStorageKey").Value.Value;
var storage = $"DefaultEndpointsProtocol=https;AccountName=kjdevstorage;AccountKey={blob};EndpointSuffix=core.windows.net";

var deliveryKey = secretClient.GetSecret("UmbracoDeliveryKey").Value.Value;

builder.Configuration["ConnectionStrings:umbracoDbDSN"] = sql;
builder.Configuration["Umbraco:Storage:AzureBlob:Media:ConnectionString"] = storage;
builder.Configuration["Umbraco:CMS:DeliveryApi:ApiKey"] = deliveryKey;

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhostAndKjeldsenDev", policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
                origin.StartsWith("http://localhost") ||
                origin.StartsWith("https://localhost") ||
                origin.EndsWith(".kjeldsen.dev"))
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .AddAzureBlobMediaFileSystem()
    .AddAzureBlobImageSharpCache()
    .Build();

var app = builder.Build();

// Apply CORS middleware early
app.UseCors("AllowLocalhostAndKjeldsenDev");

app.UseMiddleware<FreezeMiddleware>();
await app.BootUmbracoAsync();

app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();
