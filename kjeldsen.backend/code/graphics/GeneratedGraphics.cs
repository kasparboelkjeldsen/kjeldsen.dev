namespace kjeldsen.backend.code.graphics;

/// <summary>
/// The <c>generatedGraphics</c> media type: an editor writes a prompt (and optionally points at a
/// photo), and on save the model draws an SVG illustration and, when asked, a GSAP timeline that
/// animates it. The frontend inlines the SVG and runs the timeline; see
/// kjeldsen.frontend/app/components/blocks/GeneratedGraphic.vue.
/// </summary>
public static class GeneratedGraphics
{
    public const string MediaTypeAlias = "generatedGraphics";

    /// <summary>The Umbraco.AI profile that draws. Swap for an Opus profile if Sonnet struggles.</summary>
    public const string ProfileAlias = "sonnet-5-5";

    public static class Props
    {
        // What the editor fills in.
        public const string Prompt = "prompt";
        public const string ReferenceImage = "referenceImage";
        public const string Animate = "animate";
        public const string AnimationPrompt = "animationPrompt";
        public const string AspectRatio = "aspectRatio";
        public const string Regenerate = "regenerate";

        // What the model fills in.
        public const string Svg = "svg";
        public const string Script = "script";
        public const string Status = "generationStatus";
        public const string Hash = "generationHash";
    }
}
