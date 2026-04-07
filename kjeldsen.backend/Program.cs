using kjeldsen.backend.code.controllers;
using kjeldsen.backend.code.engage.Setup;
using kjeldsen.backend.code.extensions;
using kjeldsen.backend.code.mcp;
using kjeldsen.backend.code.middleware;
using kjeldsen.backend.code.services.Background;
using Umbraco.Cms.Web.Website.Controllers;
using Umbraco.Engage.Headless.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.UseEngageNoColumnStorePatch();

builder
.AddSecrets()
.AddOpenIdDictRedirectUris()
.AddApplicationInsights()
.AddCors()
.AddNoteCaptureService()
.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddEngageApiDocumentation()
    .AddComposers()
    .AddAzureBlobMediaFileSystem()
    .AddAzureBlobImageSharpCache()
    .Build()

;

// MCP server — SSE transport with capture_note tool
builder.Services
    .AddMcpServer()
    .WithHttpTransport()
    .WithTools<NoteTools>();

// background queue
builder.Services.AddSingleton<IBackgroundTaskQueue, BackgroundTaskQueue>();
builder.Services.AddHostedService<QueuedHostedService>();
var app = builder.Build();

// OpenIdDict redirect URI check � runs early before Umbraco/OpenIdDict handle login
app.UseOpenIdDictRedirectUriCheck();

app
    .UseCors("AllowLocalhostAndKjeldsenDev")
    .UseMiddleware<FreezeMiddleware>();

await app.BootUmbracoAsync();

// /mcp must be mapped before UseUmbraco so it isn't swallowed by Umbraco routing.
// UseAuthentication/UseAuthorization are also called by Umbraco internally; these calls
// are idempotent and ensure the middleware is present before MapMcp's policy check.
app.UseAuthentication();
app.UseAuthorization();
app.MapMcp("/mcp").RequireAuthorization("McpAccess");

app.AddStaticRedirects();
app.AddEngageTrackingRewrite();

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
