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
