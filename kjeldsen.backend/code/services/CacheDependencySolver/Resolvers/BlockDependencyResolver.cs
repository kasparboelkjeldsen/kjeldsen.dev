using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Strings;

namespace kjeldsen.backend.code.services.CacheDependencySolver.Resolvers
{

    public class BlockDependencyResolver
    {
        private static readonly Regex UdiRegex = new(@"umb://(?<entityType>\w+)/(?<guid>[0-9a-fA-F-]{36})", RegexOptions.Compiled);
        private static readonly Regex LocalLinkRegex = new(@"{localLink:(?<guid>[0-9a-fA-F-]{36})}", RegexOptions.Compiled);

        public IEnumerable<string> GetBlockDependencies(IContent content)
        {
            foreach (var property in content.Properties)
            {
                var editorAlias = property.PropertyType.PropertyEditorAlias;
                var rawValue = property.GetValue()?.ToString();

                if (string.IsNullOrWhiteSpace(rawValue))
                    continue;

                if (editorAlias is "Umbraco.BlockList" or "Umbraco.BlockGrid")
                {
                    var json = JObject.Parse(rawValue);
                    var contentDataArray = json["contentData"] as JArray;
                    if (contentDataArray == null) continue;

                    foreach (var block in contentDataArray)
                    {
                        var values = block["values"] as JArray;
                        if (values == null) continue;

                        foreach (var valueEntry in values)
                        {
                            var editor = valueEntry["editorAlias"]?.ToString();
                            var rawPickerValue = valueEntry["value"]?.ToString();

                            if (string.IsNullOrWhiteSpace(rawPickerValue))
                                continue;

                            foreach (var dep in ExtractDependenciesFromPickerValue(editor, rawPickerValue))
                                yield return dep;
                        }
                    }
                }
            }
        }

        private IEnumerable<string> ExtractDependenciesFromPickerValue(string editorAlias, string rawValue)
        {
            if (string.IsNullOrWhiteSpace(rawValue))
                yield break;


            // MediaPicker3: JSON array of objects with mediaKey
            if (editorAlias == "Umbraco.MediaPicker3")
            {
                var parsedArray = JsonConvert.DeserializeObject<JArray>(rawValue);
                if (parsedArray != null)
                {
                    foreach (var item in parsedArray)
                    {
                        var mediaKey = item["mediaKey"]?.ToObject<Guid>();
                        if (mediaKey.HasValue)
                            yield return $"media-{mediaKey.Value}";
                    }
                }
            }
            // MultiNodeTreePicker / MediaPicker: string or array of UDIs
            else if (editorAlias is "Umbraco.MultiNodeTreePicker" or "Umbraco.MediaPicker")
            {
                if (rawValue.StartsWith("["))
                {
                    var udiStrings = JsonConvert.DeserializeObject<IEnumerable<string>>(rawValue);
                    foreach (var udiStr in udiStrings)
                    {
                        if (UdiParser.TryParse(udiStr, out var udi) && udi is GuidUdi guidUdi)
                            yield return $"{GetPrefixFromUdi(udi)}-{guidUdi.Guid}";
                    }
                }
                else
                {
                    if (UdiParser.TryParse(rawValue, out var udi) && udi is GuidUdi guidUdi)
                        yield return $"{GetPrefixFromUdi(udi)}-{guidUdi.Guid}";
                }
            }
            // 🧨 Be dumber: always regex scan for UDI or localLink no matter the editor
            else
            {
                // Look for umb://document/... or umb://media/...
                foreach (Match match in UdiRegex.Matches(rawValue))
                {
                    var entityType = match.Groups["entityType"].Value;
                    var guid = match.Groups["guid"].Value;

                    var prefix = entityType switch
                    {
                        "document" => "content",
                        "media" => "media",
                        _ => "unknown"
                    };

                    yield return $"{prefix}-{guid}";
                }

                // Look for {localLink:...}
                foreach (Match match in LocalLinkRegex.Matches(rawValue))
                {
                    var guid = match.Groups["guid"].Value;
                    yield return $"content-{guid}";
                }
            }
        }

        private string GetPrefixFromUdi(Udi udi)
        {
            return udi.EntityType switch
            {
                "document" => "content",
                "media" => "media",
                _ => "unknown"
            };
        }
    }
}
