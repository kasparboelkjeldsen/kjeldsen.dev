using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;

namespace kjeldsen.backend.code.graphics;

/// <summary>
/// Draws the graphic while the media item is being saved, so the output lands in the same save
/// the editor pressed. That means the save waits for the model - a minute or so for an animated
/// piece - which is acceptable for a blog with one editor. A regeneration happens when the
/// prompt, reference image, animation settings or aspect ratio changed, when there is no drawing
/// yet, or when the editor ticks "regenerate". A failure is written to the status field and never
/// blocks the save.
/// </summary>
public sealed class GeneratedGraphicsSavingHandler(
    GeneratedGraphicsGenerator generator,
    ILogger<GeneratedGraphicsSavingHandler> logger)
    : INotificationAsyncHandler<MediaSavingNotification>
{
    public async Task HandleAsync(MediaSavingNotification notification, CancellationToken cancellationToken)
    {
        foreach (var media in notification.SavedEntities)
        {
            if (media.ContentType.Alias != GeneratedGraphics.MediaTypeAlias) continue;

            var request = GeneratedGraphicsRequest.From(media);
            var regenerate = media.GetValue<bool>(GeneratedGraphics.Props.Regenerate);
            var existing = media.GetValue<string>(GeneratedGraphics.Props.Svg);
            var storedHash = media.GetValue<string>(GeneratedGraphics.Props.Hash);

            if (!regenerate && !string.IsNullOrWhiteSpace(existing) && storedHash == request.Hash) continue;

            if (request.Prompt.Length == 0)
            {
                media.SetValue(GeneratedGraphics.Props.Status, "No prompt - nothing generated.");
                continue;
            }

            try
            {
                var result = await generator.GenerateAsync(request, cancellationToken);
                media.SetValue(GeneratedGraphics.Props.Svg, result.Svg);
                media.SetValue(GeneratedGraphics.Props.Script, result.Script);
                media.SetValue(GeneratedGraphics.Props.Status, result.Status);
                media.SetValue(GeneratedGraphics.Props.Hash, request.Hash);
                logger.LogInformation("Generated graphic for media {Name} ({Key}): {Status}", media.Name, media.Key, result.Status);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Generating graphic for media {Name} ({Key}) failed", media.Name, media.Key);
                media.SetValue(GeneratedGraphics.Props.Status, $"Failed {DateTime.UtcNow:u}: {ex.Message}");
            }

            // The tick is a one-shot request, not a setting.
            media.SetValue(GeneratedGraphics.Props.Regenerate, false);
        }
    }
}
