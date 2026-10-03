using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.AI;
using Umbraco.AI.Core.Chat;

namespace kjeldsen.backend.code.visio;

public sealed record DataVisioResult(string Spec, string Meta, string Summary, string Status);

/// <summary>
/// Asks the model for the ECharts option that draws the editor's dataset.
///
/// What comes back is the body of a JavaScript function <c>(data, echarts, ctx) =&gt; option</c>:
/// the dataset is handed in parsed, so the option computes from it rather than copying it, and
/// <c>ctx</c> tells it how wide the chart is, so the same function can lay itself out for a
/// half-width cell on a phone and a full-width one on a desktop. The frontend's ECharts build is
/// fixed (shared/echarts.ts) and the prompt lists exactly what is in it.
///
/// A META block in front of the script carries the aspect ratio the chart wants and a sentence
/// describing it for readers who never see it drawn.
/// </summary>
public sealed partial class DataVisioGenerator(
    IAIChatService chatService,
    ILogger<DataVisioGenerator> logger)
{
    // An option for a busy chart with a few formatters is 2-5k tokens; thinking takes some more.
    private const int MaxOutputTokens = 12000;

    // Datasets above this go in truncated. The model needs the shape and a sample, not every row,
    // and the frontend has the whole thing anyway.
    private const int DatasetCharsShown = 24_000;

    private const string MetaMarker = "===META===";
    private const string ScriptMarker = "===SCRIPT===";
    private const string EndMarker = "===END===";

    public async Task<DataVisioResult> GenerateAsync(DataVisioRequest request, CancellationToken cancellationToken)
    {
        var messages = new[]
        {
            new ChatMessage(ChatRole.System, SystemPrompt),
            new ChatMessage(ChatRole.User, UserPrompt(request)),
        };

        var watch = Stopwatch.StartNew();
        var response = await chatService.GetChatResponseAsync(
            chat => chat
                .WithAlias("data-visio")
                .WithName("Data visio")
                .WithDescription("Writes the ECharts option for a dataVisioBlock")
                .WithProfile(request.Profile)
                .WithChatOptions(new ChatOptions { MaxOutputTokens = MaxOutputTokens, Temperature = 0.4f }),
            messages,
            cancellationToken);
        watch.Stop();

        var text = response.Text;
        var (meta, script) = Parse(text);

        if (string.IsNullOrWhiteSpace(script))
        {
            logger.LogWarning("Model reply had no script. Reply starts: {Start}", text[..Math.Min(400, text.Length)]);
            throw new InvalidOperationException("The model did not return a chart script. Reply: " + text[..Math.Min(300, text.Length)]);
        }

        var forbidden = ForbiddenApi().Match(script);
        if (forbidden.Success)
        {
            throw new InvalidOperationException($"The chart script reaches outside the chart ({forbidden.Value.Trim()}); not stored.");
        }

        var (metaJson, summary, notes) = ReadMeta(meta);

        var usage = response.Usage;
        var status = $"Generated {DateTime.UtcNow:u} by {response.ModelId ?? request.Profile} " +
                     $"in {watch.Elapsed.TotalSeconds:0}s; {usage?.InputTokenCount ?? 0} in / {usage?.OutputTokenCount ?? 0} out tokens; " +
                     $"script {script.Length:n0} chars" +
                     (response.FinishReason == ChatFinishReason.Length ? "; WARNING: output was cut off at the token limit" : "") +
                     (notes.Length == 0 ? "" : $"\n\nModel's notes:\n{notes}");

        return new DataVisioResult(script, metaJson, summary, status);
    }

    private static string UserPrompt(DataVisioRequest request)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Write the chart.");
        sb.AppendLine();
        sb.AppendLine("WHAT IT SHOULD SAY:");
        sb.AppendLine(request.Prompt);
        sb.AppendLine();
        sb.AppendLine(request.ChartType.Equals(DataVisioRequest.AutoChartType, StringComparison.OrdinalIgnoreCase) || request.ChartType.Length == 0
            ? "CHART TYPE: your choice - pick the form that makes the point best."
            : $"CHART TYPE: {request.ChartType}. Use this form (adapted sensibly if the data truly cannot take it, and say so in the notes).");
        sb.AppendLine();

        var dataset = request.Dataset;
        if (dataset.Length > DatasetCharsShown)
        {
            sb.AppendLine($"DATASET (`data` at runtime; {dataset.Length:n0} characters, only the first {DatasetCharsShown:n0} shown - the rest has the same shape, so compute from `data`, never from a copy):");
            sb.AppendLine(dataset[..DatasetCharsShown]);
            sb.AppendLine("...");
        }
        else
        {
            sb.AppendLine("DATASET (this exact value is `data` at runtime):");
            sb.AppendLine(dataset);
        }
        return sb.ToString();
    }

    private const string SystemPrompt = """
        You are the data-visualisation designer for a personal developer blog with a dark, editorial design. You turn a dataset and a sentence about what matters into one beautiful, legible chart, written as an Apache ECharts option.

        THE PAGE
        The chart sits in an article on a near-black page (#07080c), inside a rounded panel (background #10131b, 1px hairline border) with the article's text around it. It is drawn with ECharts 6 at whatever width the panel has: a full-width block is 600-860 px wide on a desktop, a half-width block about 400 px, and on a phone everything is 320-400 px. The panel's height follows the aspect ratio you ask for in META.

        THE RUNTIME
        You write the BODY of a JavaScript function with the signature (data, echarts, ctx) that must `return` an ECharts option object.
        - `data` is the editor's dataset, already parsed from JSON (an object or an array). Derive everything from it: map, filter, sort, aggregate as needed. Do not paste the dataset into the option - a small lookup table of labels or colours is fine, the rows are not.
        - `echarts` is the ECharts module, for echarts.graphic.LinearGradient / RadialGradient and echarts.format.* only.
        - `ctx` describes the box: { width, height, compact, span, colors, palette, fonts }. `compact` is true under 480 px wide (phones and half-width cells); `span` is 6 or 12 grid columns. `colors` has the site palette by name: sky #7dd3fc, violet #a78bfa, ember #fb923c, gold #fcd34d, peach #fdba74, lavender #c4b5fd, mint #34d399, rose #f472b6, fg #e9ebf2, fg2 #b7bccb, muted #7c8296, line rgba(255,255,255,0.08), line2 rgba(255,255,255,0.16), surface #10131b, ink #07080c. `palette` is those accent colours as an array in that order. `fonts.sans` is Inter, `fonts.mono` is JetBrains Mono, `fonts.display` is Instrument Serif. The function is called again whenever `compact` flips, so branch on it freely.
        - A theme is already applied: Inter text, muted axis labels, hairline axis and split lines, a dark tooltip, the accent palette as the series colours, and `grid: { containLabel: true }` with modest margins. Set only what the chart needs on top of it; set colours explicitly when they carry meaning (one series highlighted, good versus bad, a brand's colour).
        - Available (nothing else is bundled): series types bar, line, pie, scatter, radar, heatmap, treemap, sunburst, sankey, funnel, gauge, boxplot, candlestick, graph; components title, legend, tooltip, grid, polar, radar, singleAxis, dataset, transform, visualMap, dataZoom (type 'inside' only), markPoint, markLine, markArea, graphic, aria; plus labelLayout and universalTransition.
        - Pure and self-contained: no document, window, fetch, timers, imports, requires, or anything outside the three arguments. No formatter that touches the DOM. Formatters that return strings are fine, and so are rich-text labels (`rich`).
        - Use ECharts' option API only; do not call `setOption` or any chart instance method yourself.

        DESIGN
        Editorial, not dashboard. One chart, one point. Think of the best charts in a well-designed newspaper.
        - Direct labelling where it works (a value at the end of a line, a number on a bar) over legends; a legend only when it earns its place, and then at the top, left-aligned, small.
        - No chart junk: no 3D, no shadows that do not aid depth, no gridlines heavier than a hairline, no outer borders. Let the panel be the frame. Horizontal grid lines only unless both axes are quantitative.
        - Title: the point, not the topic ("Build times halved after the cache landed", not "Build times") - unless the editor's sentence already is the title, then use it. Subtitle for the unit, period or source, muted. Fonts: the theme's. Title 16-18 px and 600 weight; subtitle 12-13 px muted. Nothing under 11 px.
        - Colour with intent: one accent for the series that matters, the rest muted (#7c8296 at 60-80 % opacity, or a second accent at most). Gradients under areas (the accent fading to transparent) and on bars (a touch lighter at the top) are welcome, done with echarts.graphic.LinearGradient and kept subtle. Never a white or light background.
        - Numbers readable: thousands separators, units in the axis name or the tooltip, sensible axis bounds (bars start at zero; lines may not), dates shortened sensibly.
        - Animation: leave ECharts' defaults on and give them a little character - `animationDuration: 900` to 1400, `animationEasing: 'cubicOut'`, and for several series or bars `animationDelay: (i) => i * 40` (or so) so they draw in sequence. Nothing that loops.
        - Tooltip on everything that can be hovered, `trigger: 'axis'` for cartesian charts, with the real units.
        - Compact layout: when ctx.compact is true, fewer axis labels (`axisLabel: { interval: 'auto', hideOverlap: true }`, rotate or shorten), legends to the bottom or off, smaller title, bigger `grid` bottom margin; the chart still has to read on a 340 px phone.
        - Pie and donut: donut, with the total or the headline figure in the centre (via `title` or a `graphic` text), labels outside with leader lines or none at all with the legend doing the work; never more than six slices - group the rest as "Other".
        - Bar charts of categories: horizontal when labels are long or there are more than eight of them, sorted by value unless the order means something.
        - Accessibility: the META summary is read by screen readers and shown where scripts do not run; make it the chart in two sentences, numbers included.

        OUTPUT FORMAT - exactly this, nothing before or after, no markdown fences:
        ===META===
        { "aspect": <number: width divided by height, 1.2 to 2.4 for a full-width chart, use ~1.3 for one that needs height such as a horizontal bar chart with many rows>, "summary": "<one or two sentences: what the chart shows, with the headline number>", "notes": "<one or two lines for the editor: the form you chose and why, anything you had to assume>" }
        ===SCRIPT===
        <the function body, ending in `return option;` or `return { ... };`>
        ===END===
        """;

    private static (string Meta, string Script) Parse(string text)
    {
        string meta = string.Empty, script = string.Empty;

        var metaAt = text.IndexOf(MetaMarker, StringComparison.Ordinal);
        var scriptAt = text.IndexOf(ScriptMarker, StringComparison.Ordinal);
        var endAt = text.LastIndexOf(EndMarker, StringComparison.Ordinal);

        if (metaAt >= 0 && scriptAt > metaAt)
        {
            meta = text[(metaAt + MetaMarker.Length)..scriptAt];
        }
        if (scriptAt >= 0)
        {
            var from = scriptAt + ScriptMarker.Length;
            var to = endAt > from ? endAt : text.Length;
            script = text[from..to];
        }
        else if (metaAt < 0)
        {
            // Markers dropped altogether: take the whole reply as the script if it looks like one.
            script = text.Contains("return", StringComparison.Ordinal) ? text : string.Empty;
        }

        return (StripFence(meta).Trim(), StripFence(script).Trim());
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
    /// The META block, re-serialised compactly with only the keys the frontend reads, plus the
    /// summary and notes pulled out. A META block that does not parse becomes a default aspect
    /// and empty text rather than a failure - the chart is the deliverable.
    /// </summary>
    private static (string MetaJson, string Summary, string Notes) ReadMeta(string meta)
    {
        double aspect = 1.6;
        string summary = string.Empty, notes = string.Empty;

        if (meta.Length > 0)
        {
            try
            {
                using var doc = JsonDocument.Parse(meta);
                var root = doc.RootElement;
                if (root.TryGetProperty("aspect", out var a) && a.ValueKind == JsonValueKind.Number && a.TryGetDouble(out var d) && d > 0.3 && d < 6)
                {
                    aspect = d;
                }
                if (root.TryGetProperty("summary", out var s) && s.ValueKind == JsonValueKind.String) summary = s.GetString()!.Trim();
                if (root.TryGetProperty("notes", out var n) && n.ValueKind == JsonValueKind.String) notes = n.GetString()!.Trim();
            }
            catch (JsonException)
            {
                notes = "META block did not parse; using a default aspect ratio.";
            }
        }

        var metaJson = JsonSerializer.Serialize(new { aspect = Math.Round(aspect, 3) });
        return (metaJson, summary, notes);
    }

    // Belt and braces: the prompt forbids these and the page runs the script on purpose, but a
    // script that reaches for the document, the network or a timer is refused here rather than
    // stored. Matched as a call or member access so a label such as "process" in the data is fine; the window's
    // aliases (self, top, parent) are not listed because they are ordinary variable names in a chart script.
    [GeneratedRegex(@"\b(document|window|globalThis|navigator|process|localStorage|sessionStorage|indexedDB)\s*[.\[]|\b(fetch|eval|Function|setTimeout|setInterval|requestAnimationFrame|XMLHttpRequest|WebSocket|require|importScripts|postMessage|open|alert)\s*\(|\bimport\s*[(\s'""]")]
    private static partial Regex ForbiddenApi();
}
