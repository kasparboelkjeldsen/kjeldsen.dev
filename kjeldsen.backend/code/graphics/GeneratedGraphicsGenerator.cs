using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.AI;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;
using Umbraco.AI.Core.Chat;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Services;

namespace kjeldsen.backend.code.graphics;

public sealed record GeneratedGraphicsResult(string Svg, string Script, string Status);

/// <summary>
/// Asks the model for an SVG illustration and, when wanted, a GSAP timeline for it.
///
/// The conversation is one user turn: the brief, the site's palette, the output contract, and -
/// when the editor picked one - the reference photo, downscaled and attached as image content.
/// Umbraco.AI hands that through to the Anthropic provider as an image block. The reply is parsed
/// by delimiters rather than JSON because an SVG inside a JSON string is a mess of escaping that
/// models get wrong often enough to matter.
/// </summary>
public sealed partial class GeneratedGraphicsGenerator(
    IAIChatService chatService,
    IMediaService mediaService,
    MediaFileManager mediaFileManager,
    ILogger<GeneratedGraphicsGenerator> logger)
{
    // Anthropic takes images up to 8000 px / 5 MB; the originals here are 4-6k px photos.
    // 1280 px is plenty for "what is in this picture" and keeps the input tokens down.
    private const int ReferenceImageMaxSize = 1280;

    // An animated piece is 4-10k tokens of SVG plus script; the SDK defaults to 4096.
    private const int MaxOutputTokens = 16000;

    private const string SvgMarker = "===SVG===";
    private const string ScriptMarker = "===SCRIPT===";
    private const string EndMarker = "===END===";

    public async Task<GeneratedGraphicsResult> GenerateAsync(GeneratedGraphicsRequest request, CancellationToken cancellationToken)
    {
        var prefix = $"g{request.MediaKey.ToString("N")[..6]}";
        var contents = new List<AIContent>();

        var reference = await LoadReferenceImageAsync(request.ReferenceMediaKey, cancellationToken);
        if (reference is not null)
        {
            contents.Add(new DataContent(reference.Value, "image/jpeg"));
        }

        contents.Add(new TextContent(UserPrompt(request, prefix, reference is not null)));

        var messages = new[]
        {
            new ChatMessage(ChatRole.System, SystemPrompt),
            new ChatMessage(ChatRole.User, contents),
        };

        var watch = Stopwatch.StartNew();
        var response = await chatService.GetChatResponseAsync(
            chat => chat
                .WithAlias("generated-graphics")
                .WithName("Generated graphics")
                .WithDescription("Draws an SVG illustration (and a GSAP timeline) for a generatedGraphics media item")
                .WithProfile(GeneratedGraphics.ProfileAlias)
                .WithChatOptions(new ChatOptions { MaxOutputTokens = MaxOutputTokens, Temperature = 0.7f }),
            messages,
            cancellationToken);
        watch.Stop();

        var text = response.Text;
        var (svg, script) = Parse(text);

        if (string.IsNullOrWhiteSpace(svg))
        {
            logger.LogWarning("Model reply had no SVG. Reply starts: {Start}", text[..Math.Min(400, text.Length)]);
            throw new InvalidOperationException("The model did not return an SVG. Reply: " + text[..Math.Min(300, text.Length)]);
        }

        svg = Sanitize(svg);
        if (!request.Animate) script = string.Empty;

        var usage = response.Usage;
        var status = $"Generated {DateTime.UtcNow:u} by {response.ModelId ?? GeneratedGraphics.ProfileAlias} " +
                     $"in {watch.Elapsed.TotalSeconds:0}s; {usage?.InputTokenCount ?? 0} in / {usage?.OutputTokenCount ?? 0} out tokens; " +
                     $"svg {svg.Length:n0} chars, script {script.Length:n0} chars" +
                     (reference is null ? "" : "; reference image attached") +
                     (response.FinishReason == ChatFinishReason.Length ? "; WARNING: output was cut off at the token limit" : "");

        return new GeneratedGraphicsResult(svg, script, status);
    }

    /// <summary>
    /// The picked photo, read from the media file system (blob storage in every environment) and
    /// re-encoded as a modest JPEG. Null when nothing was picked or the file cannot be read - the
    /// drawing then goes ahead from the prompt alone.
    /// </summary>
    private async Task<ReadOnlyMemory<byte>?> LoadReferenceImageAsync(Guid? mediaKey, CancellationToken cancellationToken)
    {
        if (mediaKey is null) return null;

        var media = mediaService.GetById(mediaKey.Value);
        var src = media?.GetValue<string>(Umbraco.Cms.Core.Constants.Conventions.Media.File);
        if (string.IsNullOrWhiteSpace(src))
        {
            logger.LogWarning("Reference media {Key} has no file", mediaKey);
            return null;
        }

        // The image cropper stores JSON ({"src": "/media/..."}); a plain upload stores the path.
        if (src.TrimStart().StartsWith('{'))
        {
            using var doc = JsonDocument.Parse(src);
            src = doc.RootElement.TryGetProperty("src", out var s) ? s.GetString() : null;
        }
        if (string.IsNullOrWhiteSpace(src)) return null;

        var path = mediaFileManager.FileSystem.GetRelativePath(src);
        if (!mediaFileManager.FileSystem.FileExists(path))
        {
            logger.LogWarning("Reference media file {Path} not found", path);
            return null;
        }

        await using var stream = mediaFileManager.FileSystem.OpenFile(path);
        using var image = await Image.LoadAsync(stream, cancellationToken);
        image.Mutate(x => x.AutoOrient().Resize(new ResizeOptions
        {
            Mode = ResizeMode.Max,
            Size = new Size(ReferenceImageMaxSize, ReferenceImageMaxSize),
        }));

        using var output = new MemoryStream();
        await image.SaveAsJpegAsync(output, new JpegEncoder { Quality = 82 }, cancellationToken);
        return output.ToArray();
    }

    private static string UserPrompt(GeneratedGraphicsRequest request, string prefix, bool hasReference)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Draw this illustration.");
        sb.AppendLine();
        sb.AppendLine("BRIEF:");
        sb.AppendLine(request.Prompt);
        sb.AppendLine();
        if (hasReference)
        {
            sb.AppendLine("The attached photo is a reference for subject and composition only. Redraw it as a flat vector illustration in the style described; do not trace it and do not reproduce photographic detail.");
            sb.AppendLine();
        }
        sb.AppendLine($"ASPECT RATIO: {request.AspectRatio} (set the viewBox to match, e.g. 16:9 -> viewBox=\"0 0 1600 900\").");
        sb.AppendLine($"ID PREFIX: {prefix}- (every id in the SVG starts with this).");
        sb.AppendLine();
        if (request.Animate)
        {
            sb.AppendLine("ANIMATE: yes. Also write the GSAP timeline.");
            if (!string.IsNullOrWhiteSpace(request.AnimationPrompt))
            {
                sb.AppendLine("ANIMATION DIRECTION:");
                sb.AppendLine(request.AnimationPrompt);
            }
            else
            {
                sb.AppendLine("ANIMATION DIRECTION: your choice - make the scene's main action happen, gently and with charm.");
            }
        }
        else
        {
            sb.AppendLine("ANIMATE: no. Leave the SCRIPT section empty.");
        }
        return sb.ToString();
    }

    private const string SystemPrompt = """
        You are the illustrator for a personal developer blog with a dark, editorial design. You draw small, charming flat vector illustrations as inline SVG, and when asked you animate them with GSAP.

        THE PAGE
        The graphic sits inline in an article on a near-black page (#07080c) inside a rounded panel (#10131b). Readers see it at 300-900 px wide. Site accents: sky #7dd3fc, violet #a78bfa, ember #fb923c, gold #fcd34d, warm peach #fdba74, lavender #c4b5fd, text #e9ebf2, muted #7c8296. Use a limited, harmonious palette that lives with these; soft gradients are welcome. The background of the SVG should be transparent or a very subtle dark tint - never a white or light block.

        STYLE
        Cute, warm, hand-made feel: rounded shapes, slightly imperfect curves, simple shading with one or two tones per object, no photorealism, no stock-clipart stiffness, no text unless the brief asks for it. Compose with breathing room. Everything must read clearly at 300 px wide.

        SVG RULES
        - One <svg> root with xmlns="http://www.w3.org/2000/svg", a viewBox matching the requested aspect ratio, preserveAspectRatio="xMidYMid meet", and NO width/height attributes.
        - Build the drawing from <g> groups with ids: one group per thing that could move (each hand, the heart, each cloud, ...). Every id in the document - groups, gradients, clip paths, masks - starts with the given ID PREFIX, because several of these SVGs share one web page.
        - Presentation attributes only (fill, stroke, opacity, stroke-linecap...). No <style>, no <script>, no <image>, no <foreignObject>, no external references, no base64, no CSS animations.
        - Use paths, circles, ellipses, rects, polygons, gradients. Keep it under about 12 KB: fewer, better shapes beat many tiny ones.
        - Give every group that will be animated its natural resting position in the markup - the SVG is also shown as a still image before the script runs, and it must look finished on its own.

        GSAP RULES (only when animation is requested)
        - You write the BODY of a JavaScript function with the signature (svg, gsap). It must build and `return` a gsap timeline created with gsap.timeline({ paused: true }). The host plays it once when it scrolls into view and calls .restart() on hover or tap, so the opening state must be established by the timeline itself: use .from / .fromTo (or .set at position 0) for every initial offset, never rely on the markup being pre-offset.
        - Select elements only through svg.querySelector('#<prefix>-...') or svg.querySelectorAll; never touch document, window, fetch, timers or anything outside the svg. Core GSAP only: timeline, to, from, fromTo, set, eases such as "power2.out", "back.out(1.7)", "elastic.out(1, 0.5)", "sine.inOut". No plugins, no imports, no require.
        - Transform groups, not individual path points. Set transformOrigin in the tween (e.g. transformOrigin: "50% 100%") so rotations and scales pivot sensibly; the host sets nothing for you.
        - Total length 2-5 seconds. Gentle easing, a little overlap between steps, one clear beat of delight (a squash, a bounce, a sparkle). It should end in the resting pose of the markup, or in a pose that still looks like a complete picture.

        OUTPUT FORMAT - exactly this, nothing before or after, no markdown fences, no commentary:
        ===SVG===
        <svg ...>...</svg>
        ===SCRIPT===
        (the function body, or nothing when animation was not requested)
        ===END===
        """;

    private static (string Svg, string Script) Parse(string text)
    {
        string svg = string.Empty, script = string.Empty;

        var svgAt = text.IndexOf(SvgMarker, StringComparison.Ordinal);
        var scriptAt = text.IndexOf(ScriptMarker, StringComparison.Ordinal);
        var endAt = text.LastIndexOf(EndMarker, StringComparison.Ordinal);

        if (svgAt >= 0)
        {
            var from = svgAt + SvgMarker.Length;
            var to = scriptAt > from ? scriptAt : endAt > from ? endAt : text.Length;
            svg = text[from..to];
        }
        if (scriptAt >= 0)
        {
            var from = scriptAt + ScriptMarker.Length;
            var to = endAt > from ? endAt : text.Length;
            script = text[from..to];
        }

        // Fall back to the first <svg> element when the markers were dropped or mangled.
        if (string.IsNullOrWhiteSpace(svg))
        {
            var m = SvgElement().Match(text);
            if (m.Success) svg = m.Value;
        }
        else
        {
            var m = SvgElement().Match(svg);
            if (m.Success) svg = m.Value;
        }

        return (svg.Trim(), StripFence(script).Trim());
    }

    /// <summary>A model that fences the script in ```js anyway gets the fence removed.</summary>
    private static string StripFence(string s)
    {
        s = s.Trim();
        if (!s.StartsWith("```", StringComparison.Ordinal)) return s;
        var firstLineEnd = s.IndexOf('\n');
        if (firstLineEnd < 0) return string.Empty;
        s = s[(firstLineEnd + 1)..];
        var closing = s.LastIndexOf("```", StringComparison.Ordinal);
        return closing >= 0 ? s[..closing] : s;
    }

    /// <summary>
    /// The markup goes into the page with v-html, so the handful of ways SVG can carry script are
    /// cut out here regardless of what the model was told.
    /// </summary>
    private static string Sanitize(string svg)
    {
        svg = ScriptElement().Replace(svg, string.Empty);
        svg = EventAttribute().Replace(svg, string.Empty);
        svg = JavascriptHref().Replace(svg, "$1\"#\"");
        svg = ForeignObject().Replace(svg, string.Empty);
        return svg;
    }

    [GeneratedRegex(@"<svg[\s\S]*?</svg>", RegexOptions.IgnoreCase)]
    private static partial Regex SvgElement();

    [GeneratedRegex(@"<script[\s\S]*?</script>", RegexOptions.IgnoreCase)]
    private static partial Regex ScriptElement();

    [GeneratedRegex(@"\s+on[a-z]+\s*=\s*(""[^""]*""|'[^']*')", RegexOptions.IgnoreCase)]
    private static partial Regex EventAttribute();

    [GeneratedRegex(@"((?:xlink:)?href\s*=\s*)(""\s*javascript:[^""]*""|'\s*javascript:[^']*')", RegexOptions.IgnoreCase)]
    private static partial Regex JavascriptHref();

    [GeneratedRegex(@"<foreignObject[\s\S]*?</foreignObject>", RegexOptions.IgnoreCase)]
    private static partial Regex ForeignObject();
}
