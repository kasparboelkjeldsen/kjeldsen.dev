using kjeldsen.backend.code.settings;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Web;

namespace kjeldsen.backend.code.engage.Heatmaps;

/// <summary>
/// Makes Engage's scroll heatmap draw over the real page.
///
/// The backoffice heatmap overlays its colours on an iframe pointed at <c>&lt;cms&gt;/&lt;document key&gt;</c>
/// (with <c>?culture=</c> and an optional <c>?segment=</c>) - the same address the CMS uses for its
/// own preview, which renders the document through its template. This site has no templates, so
/// that address is a 404 and the heatmap sits on an empty frame. Engage's headless docs list
/// heatmaps as unsupported for exactly this reason; the scroll data itself is collected fine.
///
/// This redirects that request to the same page on the frontend, with <c>engage-heatmap=1</c> so
/// the frontend knows it is being drawn for a heatmap: no pageview, no engagement batch, and every
/// entrance animation finished. Only published documents redirect; anything else falls through to
/// the CMS's 404 as before. The address only ever reveals a published page's public URL.
/// </summary>
public static class HeatmapFrontendRedirect
{
    public static WebApplication UseEngageHeatmapRedirect(this WebApplication app)
    {
        app.Use(async (context, next) =>
        {
            if (HttpMethods.IsGet(context.Request.Method) && TryReadKey(context.Request.Path, out var key))
            {
                var target = FrontendUrl(context, key);
                if (target != null)
                {
                    context.Response.Headers.CacheControl = "no-store";
                    context.Response.Redirect(target);
                    return;
                }
            }

            await next();
        });

        return app;
    }

    // "/<guid>" or "/<guid>/", nothing else.
    private static bool TryReadKey(PathString path, out Guid key)
    {
        key = Guid.Empty;
        var value = path.Value;
        if (string.IsNullOrEmpty(value) || value.Length < 37) return false;
        return Guid.TryParseExact(value.Trim('/'), "D", out key);
    }

    private static string? FrontendUrl(HttpContext context, Guid key)
    {
        var services = context.RequestServices;
        using var reference = services.GetRequiredService<IUmbracoContextFactory>().EnsureUmbracoContext();

        var content = reference.UmbracoContext.Content?.GetById(key);
        if (content == null) return null;

        // The Delivery API's own route for the document: the path the frontend resolves it by.
        string? culture = context.Request.Query["culture"];
        var route = services.GetRequiredService<IApiContentRouteBuilder>().Build(content, culture);
        if (route == null) return null;

        var host = services.GetRequiredService<IOptions<NuxtSettings>>().Value.Host.TrimEnd('/');
        return $"{host}{route.Path}?engage-heatmap=1";
    }
}
