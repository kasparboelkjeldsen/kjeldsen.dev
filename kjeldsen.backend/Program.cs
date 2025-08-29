using kjeldsen.backend.code.controllers;
using kjeldsen.backend.code.extensions;
using kjeldsen.backend.code.middleware;
using kjeldsen.backend.code.services.Background;
using Umbraco.Cms.Web.Website.Controllers;

var builder = WebApplication.CreateBuilder(args);

builder
    .AddSecrets()
    .AddApplicationInsights()
    .AddCors()
    .CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .AddAzureBlobMediaFileSystem()
    .AddAzureBlobImageSharpCache()
    .Build();

// background queue
builder.Services.AddSingleton<IBackgroundTaskQueue, BackgroundTaskQueue>();
builder.Services.AddHostedService<QueuedHostedService>();
builder.Services.Configure<UmbracoRenderingDefaultsOptions>(c =>
{
    c.DefaultControllerType = typeof(CustomRenderController);
});
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
