using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Entities;
using Umbraco.Cms.Core.Strings;
using Newtonsoft.Json;
using System.Collections.Generic;
using Umbraco.Cms.Core;
using Newtonsoft.Json.Linq;

namespace kjeldsen.backend.code.services.CacheDependencySolver.Resolvers
{
    public class PickerDependencyResolver
    {

        public IEnumerable<string> GetPickerDependencies(IContent content)
        {
            foreach (var property in content.Properties)
            {
                var editorAlias = property.PropertyType.PropertyEditorAlias;
                var rawValue = property.GetValue()?.ToString();

                if (string.IsNullOrWhiteSpace(rawValue))
                    continue;

                if (editorAlias == "Umbraco.MultiNodeTreePicker" || editorAlias == "Umbraco.MediaPicker" || editorAlias == "Umbraco.MediaPicker3")
                {
                    foreach (var key in ExtractGuidsFromValue(rawValue))
                        yield return key;
                }
            }
        }

        private IEnumerable<string> ExtractGuidsFromValue(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                yield break;

            // Handle JSON array of UDIs
            if (value.StartsWith("["))
            {
                if (value.Contains("{"))
                {
                    var objects = JArray.Parse(value);
                    foreach(var o in objects)
                    {
                        var key = o["mediaKey"];
                        var type = "media";
                        if (key == null)
                        {
                            key = o["key"];
                            type = "content";
                        }

                        if(key != null)
                        {
                            yield return $"{type}-{key}";

                        }
                    }
                }
                else
                {
                    var udiStrings = JsonConvert.DeserializeObject<IEnumerable<string>>(value);
                    foreach (var udiStr in udiStrings)
                    {
                        if (UdiParser.TryParse(udiStr, out var udi) && udi is GuidUdi guidUdi)
                            yield return $"{GetPrefixFromUdi(udi)}-{guidUdi.Guid}";
                    }
                }
            }
            else
            {
                // Single UDI
                if (UdiParser.TryParse(value, out var udi) && udi is GuidUdi guidUdi)
                    yield return $"{GetPrefixFromUdi(udi)}-{guidUdi.Guid}";
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
