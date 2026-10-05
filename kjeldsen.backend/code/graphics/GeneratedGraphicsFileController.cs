using Microsoft.AspNetCore.Mvc;
using SkiaSharp;
using Svg.Skia;
using Umbraco.Cms.Core.PublishedCache;

namespace kjeldsen.backend.code.graphics;

/// <summary>
/// Serves a Generated Graphics item as a file, so it has a URL like any other picture:
/// <list type="bullet">
/// <item><c>/media/svg/{key}.svg</c>, the markup as the delivery API ships it, already stripped of
/// script by the generator.</item>
/// <item><c>/media/card/{key}.jpg</c>, the drawing rasterised to a 1200x630 social card for
/// <c>og:image</c>, because hardly any social network renders an SVG there.</item>
/// </list>
/// The frontend proxies both under <c>/api/media/</c> on its own origin.
/// </summary>
[ApiController]
public sealed class GeneratedGraphicsFileController(IPublishedMediaCache mediaCache) : ControllerBase
{
    // The size Facebook, LinkedIn and X all ask for. The frontend declares it in og:image:width
    // and :height (CARD_SIZE in kjeldsen.frontend/shared/graphics.ts).
    private const int CardWidth = 1200;
    private const int CardHeight = 630;

    [HttpGet("/media/svg/{key:guid}.svg")]
    public IActionResult Svg(Guid key)
    {
        var svg = SvgOf(key);
        if (svg is null) return NotFound();

        Immutable();
        return Content(svg, "image/svg+xml; charset=utf-8");
    }

    [HttpGet("/media/card/{key:guid}.jpg")]
    public IActionResult Card(Guid key)
    {
        var svg = SvgOf(key);
        if (svg is null) return NotFound();

        using var drawing = new SKSvg();
        using var picture = drawing.FromSvg(svg);
        if (picture is null || picture.CullRect.IsEmpty) return NotFound();

        // Cover, like the hero backdrop: scale until the card is filled, then crop the overflow
        // evenly. The drawings are mostly 3:1, so the card loses some of the sides.
        var box = picture.CullRect;
        var scale = Math.Max(CardWidth / box.Width, CardHeight / box.Height);

        using var surface = SKSurface.Create(new SKImageInfo(CardWidth, CardHeight));
        var canvas = surface.Canvas;
        // The site's background, for a drawing that leaves any of itself transparent.
        canvas.Clear(SKColor.Parse("#07080c"));
        canvas.Translate((CardWidth - box.Width * scale) / 2, (CardHeight - box.Height * scale) / 2);
        canvas.Scale(scale);
        canvas.Translate(-box.Left, -box.Top);
        canvas.DrawPicture(picture);

        // JPEG over PNG: the gradients make a PNG of the same card 90-240 KB against 30-50 KB,
        // with no difference at the size a card is shown.
        using var image = surface.Snapshot();
        using var jpeg = image.Encode(SKEncodedImageFormat.Jpeg, 85);

        Immutable();
        return File(jpeg.ToArray(), "image/jpeg");
    }

    private string? SvgOf(Guid key)
    {
        var media = mediaCache.GetById(key);
        if (media is null || media.ContentType.Alias != GeneratedGraphics.MediaTypeAlias) return null;

        var svg = media.Value<string>(GeneratedGraphics.Props.Svg);
        return string.IsNullOrWhiteSpace(svg) ? null : svg;
    }

    // The frontend adds ?v=<updateDate> to the URL, so a regenerated drawing is a new URL and the
    // old one may live in caches for as long as they like.
    private void Immutable() => Response.Headers.CacheControl = "public, max-age=31536000, immutable";
}
