namespace kjeldsen.backend.code.visio;

/// <summary>
/// The <c>dataVisioBlock</c> element type: an editor pastes a dataset (JSON), writes what the chart
/// should say, picks a chart type and a model, and on save the model writes the ECharts option
/// that draws it. The frontend runs that against the dataset with a preconfigured ECharts build;
/// see kjeldsen.frontend/app/components/blocks/DataVisioBlock.vue and shared/visio.ts.
/// </summary>
public static class DataVisio
{
    public const string ElementTypeAlias = "dataVisioBlock";

    /// <summary>The Umbraco.AI profiles the block's Model dropdown can name.</summary>
    public const string SonnetProfile = "sonnet-5-5";
    public const string OpusProfile = "opus-5-5";

    public static class Props
    {
        // What the editor fills in.
        public const string Dataset = "dataset";
        public const string Prompt = "prompt";
        public const string ChartType = "chartType";
        public const string Model = "model";
        public const string Caption = "caption";
        public const string Regenerate = "regenerate";

        // What the model fills in.
        public const string Spec = "spec";
        public const string Meta = "meta";
        public const string Summary = "summary";
        public const string Status = "generationStatus";
        public const string Hash = "generationHash";
    }

    /// <summary>
    /// The dropdown's labels are for people ("Opus 5.5 (best)"); the profile alias is what the
    /// chat service wants. Anything mentioning Opus is Opus, everything else - including an empty
    /// pick - is Sonnet, which is fast and good enough for most charts.
    /// </summary>
    public static string ProfileFor(string? modelChoice) =>
        modelChoice?.Contains("opus", StringComparison.OrdinalIgnoreCase) == true ? OpusProfile : SonnetProfile;
}
