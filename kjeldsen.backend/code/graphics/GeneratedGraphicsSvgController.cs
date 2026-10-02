using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.PublishedCache;

namespace kjeldsen.backend.code.graphics;

/// <summary>
/// Serves a Generated Graphics item as a plain SVG file, so it has a URL like any other picture:
/// <c>/media/svg/{key}.svg</c>. The frontend proxies it at <c>/api/media/svg/{key}.svg</c> for
/// <c>og:image</c> and anything else that wants a file rather than inline markup. The markup is
/// what the delivery API ships, already stripped of script by the generator.
/// </summary>
[ApiController]
public sealed class GeneratedGraphicsSvgController(IPublishedMediaCache mediaCache) : ControllerBase
{
    [HttpGet("/media/svg/{key:guid}.svg")]
    public IActionResult Get(Guid key)
    {
        var media = mediaCache.GetById(key);
        if (media is null || media.ContentType.Alias != GeneratedGraphics.MediaTypeAlias) return NotFound();

        var svg = media.Value<string>(GeneratedGraphics.Props.Svg);
        if (string.IsNullOrWhiteSpace(svg)) return NotFound();

        // The frontend adds ?v=<updateDate> to the URL, so a regenerated drawing is a new URL and
        // the old one may live in caches for as long as they like.
        Response.Headers.CacheControl = "public, max-age=31536000, immutable";
        return Content(svg, "image/svg+xml; charset=utf-8");
    }
}
