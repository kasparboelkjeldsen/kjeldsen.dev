using Umbraco.Cms.Infrastructure.DeliveryApi;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace kjeldsen.backend.code.graphics;

/// <summary>
/// Puts the drawing on the wire whenever a Generated Graphics item is picked.
///
/// The delivery API leaves a picked media item's properties out unless the request expands them
/// (<c>?expand=properties[grid[properties[image]]]</c>), and the backoffice block preview, which
/// serialises the block through the same converters, never asks. A photo needs nothing beyond its
/// URL, but this media type *is* its properties, so they go along by default - only the three the
/// frontend renders from, not the prompt and bookkeeping.
/// </summary>
public sealed class GeneratedGraphicsApiMediaBuilder(IApiMediaWithCropsBuilder inner) : IApiMediaWithCropsBuilder
{
    private static readonly string[] Delivered =
    [
        GeneratedGraphics.Props.Svg,
        GeneratedGraphics.Props.Script,
        GeneratedGraphics.Props.Animate,
    ];

    public IApiMediaWithCrops Build(MediaWithCrops media) => WithDrawing(inner.Build(media), media.Content);

    public IApiMediaWithCrops Build(IPublishedContent media) => WithDrawing(inner.Build(media), media);

    private static IApiMediaWithCrops WithDrawing(IApiMediaWithCrops result, IPublishedContent media)
    {
        if (media.ContentType.Alias != GeneratedGraphics.MediaTypeAlias) return result;
        if (result.Properties.ContainsKey(GeneratedGraphics.Props.Svg)) return result; // expanded already

        foreach (var alias in Delivered)
        {
            result.Properties[alias] = media.Value(alias);
        }

        return result;
    }
}
