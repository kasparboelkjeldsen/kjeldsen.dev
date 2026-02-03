using kjeldsen.backend.code.engage.Services;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewSettings;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Web.Common;
using Umbraco.Engage.Infrastructure.Heatmaps;

namespace kjeldsen.backend.code.blockpreview;

public class BlockPreviewSettings : IBlockPreviewSettings
{
    private readonly HeadlessBlockPreviewOptions _default;
    private readonly IUmbracoHelperAccessor _umbracoHelperAccessor;
    private readonly IPublishedUrlProvider _publishedUrlProvider;

    // Theme definition based on comment above
    private static readonly Dictionary<string, (string[] primary, string[] secondary)> ThemePalette = new(StringComparer.OrdinalIgnoreCase)
    {
        ["autumn"] = (new[]{"#0B3D2E", "#F15A29", "#000000", "#FFFFFF"}, new[]{"#EBD9C6", "#BF9474", "#E39624"}),
        ["summer"] = (new[]{"#0F403D", "#0F6B57", "#1A9973", "#FFFFFF"}, new[]{"#BF9474", "#FED613", "#0F403D"}),
        ["winter"] = (new[]{"#233270", "#A6D1F0", "#2F68AB", "#E4F4FE"}, new[]{"#FFFFFF", "#4E008E", "#4E008E"}),
        ["spring"] = (new[]{"#91D6AC", "#FED613", "#BF9474", "#FFF8BF"}, new[]{"#EA5B34", "#0F403D", "#0F6B57"})
    };

    public BlockPreviewSettings(IOptions<HeadlessBlockPreviewOptions> options, IUmbracoHelperAccessor umbracoHelperAccessor, IPublishedUrlProvider publishedUrlProvider)
    {
        _default = options.Value;
        _umbracoHelperAccessor = umbracoHelperAccessor;
        _publishedUrlProvider = publishedUrlProvider;
    }

    public HeadlessBlockPreviewOptions Options(Guid? pageId, string? culture, string? resolvedDomain)
    {
        // Return default when we cannot resolve content
        _umbracoHelperAccessor.TryGetUmbracoHelper(out var umbracoHelper);
        if (umbracoHelper == null || pageId == null)
            return _default;

        var content = umbracoHelper.Content(pageId);
        if (content == null)
            return _default;

        var theme = content.Value<string>("theme")?.ToLower() ?? "autumn";
        var url = content.Url(_publishedUrlProvider) ?? string.Empty;

        // Resolve colors with fallbacks
        if (!ThemePalette.TryGetValue(theme, out var palette))
        {
            palette = ThemePalette["autumn"]; // fallback
        }
        var background = palette.secondary.FirstOrDefault() ?? "#FFFFFF";
        var text = palette.primary[2] ?? "#000000";

        // If specific page condition (example zoo path) override background but keep text color
        if (url.Contains("/zoo", StringComparison.OrdinalIgnoreCase))
        {
            var cssVars = $"--zoo-primary-1: {palette.primary[0]}; --zoo-primary-2: {palette.primary[1]}; --zoo-primary-3: {palette.primary[2]}; --zoo-primary-4: {palette.primary[3]}; --zoo-secondary-1: {palette.secondary[0]}; --zoo-secondary-2: {palette.secondary[1]}; --zoo-secondary-3: {palette.secondary[2]};";
            
            var hardcodedStyles = $@"
.text-\[var\(--zoo-primary-2\)\] {{ color: {palette.primary[1]} !important; }}
.text-\[var\(--zoo-primary-1\)\] {{ color: {palette.primary[0]} !important; }}
.border-\[var\(--zoo-secondary-2\)\] {{ border-color: {palette.secondary[1]} !important; }}
.bg-\[var\(--zoo-primary-2\)\] {{ background-color: {palette.primary[1]} !important; }}
.hover\:bg-\[var\(--zoo-primary-1\)\]:hover {{ background-color: {palette.primary[0]} !important; }}
";

            var template = $"<link rel=\"stylesheet\" href=\"/css/cms.css\" /><style>:root {{ {cssVars} }} {hardcodedStyles} p, h1, h2, h3 {{color: {text} !important}} .__block-preview {{ background: {background}; color: {text}; pointer-events: none; padding:10px; }}</style><div class=\"__block-preview\">{{{{html}}}}</div>";
            _default.Template = template;
        }
        
        return _default;

    }

    public string FinalHtmlManipulation(string html, Guid? pageId, string? culture, string? resolvedDomain)
    {
        return html;
    }
}

public class CustomBlockPreviewSettings : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        var descriptor = builder.Services.FirstOrDefault(s => s.ServiceType == typeof(IBlockPreviewSettings));
        if (descriptor != null)
        {
            builder.Services.Remove(descriptor);
        }
        builder.Services.AddTransient<IBlockPreviewSettings, BlockPreviewSettings>();
    }
}