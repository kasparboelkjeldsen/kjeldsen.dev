using kjeldsen.backend.code.controllers;
using kjeldsen.backend.code.engage.Setup;
using kjeldsen.backend.code.extensions;
using kjeldsen.backend.code.middleware;
using kjeldsen.backend.code.services.Background;
using Umbraco.Cms.Web.Website.Controllers;
using Umbraco.Engage.Headless.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.UseEngageNoColumnStorePatch();

builder
    .AddSecrets()
    .AddApplicationInsights()
    .AddCors()
    .CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddEngageApiDocumentation()
    .AddComposers()
    .AddAzureBlobMediaFileSystem()
    .AddAzureBlobImageSharpCache()
    .Build();

// background queue
builder.Services.AddSingleton<IBackgroundTaskQueue, BackgroundTaskQueue>();
builder.Services.AddHostedService<QueuedHostedService>();
var app = builder.Build();

app
    .UseCors("AllowLocalhostAndKjeldsenDev")
    .UseMiddleware<FreezeMiddleware>();

await app.BootUmbracoAsync();

app.AddStaticRedirects();

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
