using DeviceDetectorNET;
using DeviceDetectorNET.Class;
using DeviceDetectorNET.Results;
using Umbraco.Cms.Core.Composing;
using Umbraco.Engage.Data.Analytics.Collection.Pageview;
using Umbraco.Engage.Data.Analytics.Processed.Visitor;
using Umbraco.Engage.Infrastructure.Analytics.Processed;
using Umbraco.Engage.Infrastructure.Analytics.Processing.Extractors;
using Umbraco.Engage.Infrastructure.Analytics.Utils; // for IsNullOrWhiteSpace extensions

namespace kjeldsen.backend.code.engage.Services;

/// <summary>
/// Custom implementation of <see cref="IRawPageviewBotVisitorExtractor"/> based on the default Umbraco Engage implementation.
/// Copied here so logic can be tweaked without modifying the package assembly.
/// </summary>
public class CustomRawPageviewBotVisitorExtractor : IRawPageviewBotVisitorExtractor
{
    private readonly IUserAgentParser _userAgentParser;
    private readonly IDbVisitorTypeBotVersionRepository _botVersionRepository;

    public CustomRawPageviewBotVisitorExtractor(
        IUserAgentParser userAgentParser,
        IDbVisitorTypeBotVersionRepository botVersionRepository)
    {
        _userAgentParser = userAgentParser;
        _botVersionRepository = botVersionRepository;
    }

    public IBotVisitor? Extract(IRawPageview rawPageview, VisitorType? visitorType = null)
    {
        if (rawPageview == null) return null;
        if (visitorType.HasValue && visitorType.Value != VisitorType.Bot) return null;

        // Determine bot name + version strings
        string botName;
        string botVersion;

        if (string.IsNullOrWhiteSpace(rawPageview.UserAgent))
        {
            botName = botVersion = "Generic Bot";
        }
        else if (!TryGetBotNameAndVersion(rawPageview.UserAgent!, out botName, out botVersion))
        {
            // Not identified as a bot by UA parser; only continue if explicitly classified as Bot already
            if (visitorType.GetValueOrDefault() != VisitorType.Bot)
                return null;
            // Fallback: use the raw UA string for both name + version
            botName = botVersion = rawPageview.UserAgent!;
        }

        // Look up an existing stored bot visitor version
        var existing = _botVersionRepository.FindByName(botName, botVersion);
        if (existing?.Visitor?.Id > 0)
        {
            return new BotVisitor(
                existing.Visitor.Id,
                existing.Visitor.ExternalId,
                existing.Visitor.Timestamp,
                existing.Bot.Name ?? "",
                existing.Version ?? "",
                existing.CreatedByUmbracoUserKey,
                existing.Bot.Label);
        }

        // Create a transient visitor (Id = 0) – repository layer likely persists later in pipeline
        return new BotVisitor(
            0,
            rawPageview.ExternalId ?? Guid.NewGuid(),
            DateTime.UtcNow,
            botName,
            botVersion);
    }

    // Adapted from default implementation. Returns true if the UA is recognized as a bot and outputs name + version strings.
    private bool TryGetBotNameAndVersion(string userAgent, out string botName, out string botVersion)
    {
        botName = null!;
        botVersion = null!;

        DeviceDetector detector = _userAgentParser.ParseUserAgent(userAgent, true);
        if (!detector.IsBot()) return false;

        ParseResult<BotMatchResult> bot = detector.GetBot();
        if (bot?.Success != true) return false;

        var match = bot.Match;
        if (match == null) return false;

        const string genericBot = "Generic Bot";
        const string unidentified = "Unidentified bot";

        botName = match.Name;
        if (botName.IsNullOrWhiteSpace() || string.Equals(botName, genericBot, StringComparison.InvariantCultureIgnoreCase))
        {
            botName = unidentified;
        }

        // Default version is same as name until we know more
        botVersion = botName;

        bool hasCategory = !match.Category.IsNullOrWhiteSpace();
        bool hasProducer = match.Producer != null && !match.Producer.Name.IsNullOrWhiteSpace();

        if (hasCategory && hasProducer)
        {
            botVersion = $"{match.Category} | {match.Producer.Name}";
        }
        else if (hasCategory)
        {
            botVersion = match.Category;
        }

        return true;
    }
}

public class CustomRawPageviewBotVisitorExtractorComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // Remove the default registration so our custom one takes precedence.
        /*
        var descriptor = builder.Services.FirstOrDefault(s => s.ServiceType == typeof(IRawPageviewBotVisitorExtractor));
        if (descriptor != null)
        {
            builder.Services.Remove(descriptor);
        }
        builder.Services.AddTransient<IRawPageviewBotVisitorExtractor, CustomRawPageviewBotVisitorExtractor>();
        */
    }
}