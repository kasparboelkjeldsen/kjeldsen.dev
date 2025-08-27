using kjeldsen.backend.code.extensions;
using kjeldsen.backend.code.middleware;

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
