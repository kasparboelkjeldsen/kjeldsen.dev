using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Serialization;
using Azure.Storage.Blobs;
using ModelContextProtocol.Server;

namespace kjeldsen.backend.code.mcp;

public sealed class CalendarInfo
{
    [JsonPropertyName("start")]
    public string Start { get; set; } = default!;

    [JsonPropertyName("end")]
    public string? End { get; set; }

    [JsonPropertyName("all_day")]
    public bool AllDay { get; set; }
}

[McpServerToolType]
public class NoteTools(
    [FromKeyedServices("mcp-notes")] BlobContainerClient blobClient,
    ILogger<NoteTools> logger)
{
    private static readonly string[] ValidTypes =
        ["idea", "remember", "todo", "reference", "observation", "calendar-event"];

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        // Ensures null fields (context, calendar, end) are written as null, never omitted
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        WriteIndented = false
    };

    [McpServerTool(Name = "capture_note"), Description(
        "Capture a note, thought, reminder, or calendar event to persistent storage. " +
        "Use type='calendar-event' for anything with a date/time, and always supply the calendar block. " +
        "For all other types omit the calendar block.")]
    public async Task<string> CaptureNote(
        [Description("Type of note: idea | remember | todo | reference | observation | calendar-event")]
        string type,
        [Description("The actual thought, note content, or calendar event title")]
        string content,
        [Description("Optional tags for categorisation")]
        string[]? tags = null,
        [Description("Optional: what prompted this note or capture")]
        string? context = null,
        [Description("Required when type is 'calendar-event'. Must be omitted for all other types.")]
        CalendarInfo? calendar = null,
        CancellationToken cancellationToken = default)
    {
        if (!ValidTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            throw new ArgumentException(
                $"Invalid type '{type}'. Must be one of: {string.Join(", ", ValidTypes)}.");

        if (type == "calendar-event" && calendar is null)
            throw new ArgumentException("'calendar' block is required when type is 'calendar-event'.");

        var note = new NoteDocument
        {
            Id = Guid.CreateVersion7().ToString("D"),
            CapturedAt = DateTime.UtcNow.ToString("o"),
            Source = "claude-chat",
            Processed = false,
            Type = type.ToLowerInvariant(),
            Content = content,
            Tags = tags ?? [],
            Context = context,
            // Explicit null for non-calendar types so the field is always present in the blob
            Calendar = type.Equals("calendar-event", StringComparison.OrdinalIgnoreCase) ? calendar : null
        };

        var json = JsonSerializer.Serialize(note, JsonOptions);

        await blobClient.UploadBlobAsync(
            $"{note.Id}.json",
            BinaryData.FromString(json),
            cancellationToken);

        logger.LogInformation("MCP capture_note: id={Id} type={Type}", note.Id, note.Type);

        return $"Captured. id={note.Id}";
    }
}

file sealed class NoteDocument
{
    public string Id { get; set; } = default!;
    public string CapturedAt { get; set; } = default!;
    public string Source { get; set; } = default!;
    public bool Processed { get; set; }
    public string Type { get; set; } = default!;
    public string Content { get; set; } = default!;
    public string[] Tags { get; set; } = [];
    public string? Context { get; set; }
    public CalendarInfo? Calendar { get; set; }
}
