using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace kjeldsen.backend.code.visio;

/// <summary>
/// Writes each Data Visio block's chart while the page is being saved, so the output lands in the
/// same save the editor pressed - the save waits for the model, half a minute or so per chart.
///
/// Blocks live inside the page's block grid value, which is JSON: the block editor's layout, a
/// <c>contentData</c> array of items with their <c>values</c>, settings and exposure. The handler
/// walks that JSON for items of the block's element type, reads the brief off their values,
/// writes the result back into the same values, and sets the property again. Nested block
/// editors (a block list inside a grid cell, blocks in rich text) are strings or objects inside
/// those values and are walked the same way, so a chart works wherever the element is allowed.
///
/// A regeneration happens when the dataset, prompt, chart type or model changed, when there is no
/// chart yet, or when the editor ticks "regenerate". A failure is written to the block's status
/// and never blocks the save.
/// </summary>
public sealed class DataVisioSavingHandler(
    DataVisioGenerator generator,
    IContentTypeService contentTypeService,
    ILogger<DataVisioSavingHandler> logger)
    : INotificationAsyncHandler<ContentSavingNotification>
{
    private static readonly JsonSerializerOptions WriteOptions = new()
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    public async Task HandleAsync(ContentSavingNotification notification, CancellationToken cancellationToken)
    {
        var elementType = contentTypeService.Get(DataVisio.ElementTypeAlias);
        if (elementType is null) return;
        var elementKey = elementType.Key.ToString();

        foreach (var content in notification.SavedEntities)
        {
            foreach (var property in content.Properties)
            {
                foreach (var value in property.Values.ToList())
                {
                    if (value.EditedValue is not string json || !json.Contains("contentData", StringComparison.Ordinal)) continue;

                    JsonNode? root;
                    try { root = JsonNode.Parse(json); }
                    catch (JsonException) { continue; }
                    if (root is null) continue;

                    var changed = await WalkAsync(root, elementKey, content, cancellationToken);
                    if (changed)
                    {
                        content.SetValue(property.Alias, root.ToJsonString(WriteOptions), value.Culture, value.Segment);
                    }
                }
            }
        }
    }

    /// <summary>
    /// Depth-first over the JSON. A block item is an object carrying the element type's key and a
    /// values array; a string that holds another block editor's JSON is parsed, walked, and
    /// written back when something inside it changed. Objects and arrays are edited in place -
    /// a node cannot be re-attached to its own parent - so only strings are ever replaced.
    /// </summary>
    private async Task<bool> WalkAsync(JsonNode node, string elementKey, IContent content, CancellationToken cancellationToken)
    {
        var changed = false;
        switch (node)
        {
            case JsonObject obj:
                if (IsBlockItem(obj, elementKey, out var values))
                {
                    return await ProcessBlockAsync(obj, values!, content, cancellationToken);
                }
                foreach (var key in obj.Select(p => p.Key).ToList())
                {
                    var child = obj[key];
                    if (child is null) continue;
                    var (childChanged, replacement) = await WalkChildAsync(child, elementKey, content, cancellationToken);
                    if (replacement is not null) obj[key] = replacement;
                    changed |= childChanged;
                }
                break;

            case JsonArray arr:
                for (var i = 0; i < arr.Count; i++)
                {
                    var child = arr[i];
                    if (child is null) continue;
                    var (childChanged, replacement) = await WalkChildAsync(child, elementKey, content, cancellationToken);
                    if (replacement is not null) arr[i] = replacement;
                    changed |= childChanged;
                }
                break;
        }
        return changed;
    }

    /// <summary>
    /// Walks a child node. The replacement is non-null only for a nested block editor's JSON
    /// string that changed and was re-serialised; containers change in place.
    /// </summary>
    private async Task<(bool Changed, JsonNode? Replacement)> WalkChildAsync(JsonNode child, string elementKey, IContent content, CancellationToken cancellationToken)
    {
        if (child is JsonValue leaf)
        {
            if (!leaf.TryGetValue<string>(out var s) || !s.Contains("contentData", StringComparison.Ordinal)) return (false, null);
            JsonNode? nested;
            try { nested = JsonNode.Parse(s); }
            catch (JsonException) { return (false, null); }
            if (nested is null) return (false, null);
            return await WalkAsync(nested, elementKey, content, cancellationToken)
                ? (true, JsonValue.Create(nested.ToJsonString(WriteOptions)))
                : (false, null);
        }

        return (await WalkAsync(child, elementKey, content, cancellationToken), null);
    }

    private static bool IsBlockItem(JsonObject obj, string elementKey, out JsonArray? values)
    {
        values = null;
        if (obj["contentTypeKey"] is not JsonValue typeKey || !typeKey.TryGetValue<string>(out var key)) return false;
        if (!string.Equals(key, elementKey, StringComparison.OrdinalIgnoreCase)) return false;
        values = obj["values"] as JsonArray;
        return values is not null;
    }

    private async Task<bool> ProcessBlockAsync(JsonObject item, JsonArray values, IContent content, CancellationToken cancellationToken)
    {
        var block = new BlockValues(values);
        var blockKey = item["key"] is JsonValue k && k.TryGetValue<string>(out var ks) && Guid.TryParse(ks, out var g) ? g : Guid.Empty;

        var request = new DataVisioRequest(
            blockKey,
            block.GetString(DataVisio.Props.Dataset).Trim(),
            block.GetString(DataVisio.Props.Prompt).Trim(),
            block.GetString(DataVisio.Props.ChartType).Trim(),
            DataVisio.ProfileFor(block.GetString(DataVisio.Props.Model)));

        var regenerate = block.GetBool(DataVisio.Props.Regenerate);
        var existing = block.GetString(DataVisio.Props.Spec);
        var storedHash = block.GetString(DataVisio.Props.Hash);

        if (!regenerate && !string.IsNullOrWhiteSpace(existing) && storedHash == request.Hash) return false;
        logger.LogInformation("Chart for block {Block} on {Name}: {Reason}", blockKey, content.Name,
            regenerate ? "regenerate ticked" : string.IsNullOrWhiteSpace(existing) ? "no chart yet" : $"brief changed ({storedHash} -> {request.Hash})");

        if (request.Dataset.Length == 0 || request.Prompt.Length == 0)
        {
            block.Set(DataVisio.Props.Status, "No dataset or no prompt - nothing generated.");
            return true;
        }

        try
        {
            using var _ = JsonDocument.Parse(request.Dataset);
        }
        catch (JsonException ex)
        {
            block.Set(DataVisio.Props.Status, $"Dataset is not valid JSON: {ex.Message}");
            block.SetBool(DataVisio.Props.Regenerate, false);
            return true;
        }

        try
        {
            var result = await generator.GenerateAsync(request, cancellationToken);
            block.Set(DataVisio.Props.Spec, result.Spec);
            block.Set(DataVisio.Props.Meta, result.Meta);
            block.Set(DataVisio.Props.Summary, result.Summary);
            block.Set(DataVisio.Props.Status, result.Status);
            block.Set(DataVisio.Props.Hash, request.Hash);
            logger.LogInformation("Generated chart for block {Block} on {Name} ({Key}): {Status}", blockKey, content.Name, content.Key, result.Status);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogError(ex, "Generating chart for block {Block} on {Name} ({Key}) failed", blockKey, content.Name, content.Key);
            block.Set(DataVisio.Props.Status, $"Failed {DateTime.UtcNow:u}: {ex.Message}");
        }

        // The tick is a one-shot request, not a setting.
        block.SetBool(DataVisio.Props.Regenerate, false);
        return true;
    }

    /// <summary>
    /// A block item's <c>values</c>: one entry per property the editor touched, as
    /// <c>{ editorAlias, culture, segment, alias, value }</c>. A property never touched has no
    /// entry, so writing one may mean adding it.
    /// </summary>
    private sealed class BlockValues(JsonArray values)
    {
        private JsonObject? Find(string alias) =>
            values.OfType<JsonObject>().FirstOrDefault(v =>
                v["alias"] is JsonValue a && a.TryGetValue<string>(out var s) && s == alias);

        public string GetString(string alias)
        {
            var entry = Find(alias);
            var value = entry?["value"];
            // A dropdown's picks are an array even for a single pick - as a JSON array on the way
            // in from the backoffice, as a string holding one by the time the saving notification
            // sees it (the property editor has converted the value by then). Only a dropdown is
            // unwrapped: a dataset is a JSON array too, and that one is wanted whole.
            var dropdown = entry?["editorAlias"] is JsonValue e && e.TryGetValue<string>(out var editor) && editor.Contains("DropDown", StringComparison.OrdinalIgnoreCase);
            return value switch
            {
                JsonValue v when v.TryGetValue<string>(out var s) => dropdown ? FirstOfArray(s) : s,
                JsonValue v => v.ToJsonString(),
                JsonArray arr => arr.FirstOrDefault() is JsonValue first && first.TryGetValue<string>(out var f) ? f : string.Empty,
                _ => string.Empty,
            };
        }

        private static string FirstOfArray(string s)
        {
            if (!s.StartsWith('[')) return s;
            try
            {
                var arr = JsonNode.Parse(s) as JsonArray;
                if (arr is null) return s;
                return arr.FirstOrDefault() is JsonValue first && first.TryGetValue<string>(out var f) ? f : string.Empty;
            }
            catch (JsonException)
            {
                return s;
            }
        }

        public bool GetBool(string alias)
        {
            var value = Find(alias)?["value"];
            if (value is not JsonValue v) return false;
            if (v.TryGetValue<bool>(out var b)) return b;
            if (v.TryGetValue<int>(out var i)) return i != 0;
            if (v.TryGetValue<string>(out var s)) return s is "1" or "true" or "True";
            return false;
        }

        public void Set(string alias, string value)
        {
            var entry = Find(alias);
            if (entry is null)
            {
                entry = NewEntry(alias, "Umbraco.TextArea");
                values.Add(entry);
            }
            entry["value"] = JsonValue.Create(value);
        }

        public void SetBool(string alias, bool value)
        {
            var entry = Find(alias);
            if (entry is null)
            {
                if (!value) return;
                entry = NewEntry(alias, "Umbraco.TrueFalse");
                values.Add(entry);
            }
            // Keep whatever form the editor stored it in.
            entry["value"] = entry["value"] is JsonValue v && v.TryGetValue<string>(out _)
                ? JsonValue.Create(value ? "1" : "0")
                : JsonValue.Create(value);
        }

        /// <summary>
        /// Shaped like the entries already there: the sibling supplies any field this code does
        /// not know about, so a new entry survives whatever the block editor expects next.
        /// </summary>
        private JsonObject NewEntry(string alias, string editorAlias)
        {
            var template = values.OfType<JsonObject>().FirstOrDefault();
            var entry = new JsonObject();
            if (template is not null)
            {
                foreach (var (key, node) in template)
                {
                    entry[key] = node?.DeepClone();
                }
            }
            entry["editorAlias"] = editorAlias;
            entry["culture"] = null;
            entry["segment"] = null;
            entry["alias"] = alias;
            entry["value"] = null;
            return entry;
        }
    }
}
