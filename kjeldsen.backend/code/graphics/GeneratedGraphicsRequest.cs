using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Umbraco.Cms.Core.Models;

namespace kjeldsen.backend.code.graphics;

/// <summary>
/// The editor's side of a generated graphic, read off the media item. The hash of it is stored
/// with the output, so a save that changes nothing the model would see does not pay for a new
/// drawing.
/// </summary>
public sealed record GeneratedGraphicsRequest(
    Guid MediaKey,
    string Prompt,
    Guid? ReferenceMediaKey,
    bool Animate,
    string? AnimationPrompt,
    string AspectRatio)
{
    public const string DefaultAspectRatio = "16:9";

    public static GeneratedGraphicsRequest From(IMedia media) => new(
        media.Key,
        media.GetValue<string>(GeneratedGraphics.Props.Prompt)?.Trim() ?? string.Empty,
        FirstMediaKey(media.GetValue<string>(GeneratedGraphics.Props.ReferenceImage)),
        media.GetValue<bool>(GeneratedGraphics.Props.Animate),
        media.GetValue<string>(GeneratedGraphics.Props.AnimationPrompt)?.Trim(),
        media.GetValue<string>(GeneratedGraphics.Props.AspectRatio)?.Trim() is { Length: > 0 } ratio
            ? ratio
            : DefaultAspectRatio);

    /// <summary>Short, stable fingerprint of everything the model is shown.</summary>
    public string Hash
    {
        get
        {
            var text = string.Join('\u001f', Prompt, ReferenceMediaKey, Animate, AnimationPrompt, AspectRatio);
            return Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(text)))[..16];
        }
    }

    /// <summary>
    /// Media picker values are a JSON array of picked items; the item's <c>mediaKey</c> is the
    /// media node, <c>key</c> is the picker entry itself.
    /// </summary>
    private static Guid? FirstMediaKey(string? pickerValue)
    {
        if (string.IsNullOrWhiteSpace(pickerValue)) return null;
        try
        {
            using var doc = JsonDocument.Parse(pickerValue);
            if (doc.RootElement.ValueKind != JsonValueKind.Array) return null;
            foreach (var item in doc.RootElement.EnumerateArray())
            {
                if (item.TryGetProperty("mediaKey", out var key) && key.TryGetGuid(out var guid)) return guid;
            }
        }
        catch (JsonException)
        {
            // An unreadable picker value is treated as "no reference image" rather than a failure.
        }
        return null;
    }
}
