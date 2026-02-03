using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Services;
using System.Text.Json;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Strings;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core;
using Umbraco.Extensions;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;

[ApiController]
public class ZooImportController : Controller
{
    private readonly IContentService _contentService;
    private readonly IMediaService _mediaService;
    private readonly MediaFileManager _mediaFileManager;
    private readonly IShortStringHelper _shortStringHelper;
    private readonly IContentTypeBaseServiceProvider _contentTypeBaseServiceProvider;
    private readonly MediaUrlGeneratorCollection _mediaUrlGeneratorCollection;

    const string AnimalContentContainer = "2e0492d1-5156-458a-9b9a-96d8c4e48715";
    const string AnimalMediaContainer = "eaa11071-405f-4d32-a93f-8a4a3484d24f";

    public ZooImportController(
        IContentService contentService, 
        IMediaService mediaService,
        MediaFileManager mediaFileManager,
        IShortStringHelper shortStringHelper,
        IContentTypeBaseServiceProvider contentTypeBaseServiceProvider,
        MediaUrlGeneratorCollection mediaUrlGeneratorCollection)
    {
        _contentService = contentService;
        _mediaService = mediaService;
        _mediaFileManager = mediaFileManager;
        _shortStringHelper = shortStringHelper;
        _contentTypeBaseServiceProvider = contentTypeBaseServiceProvider;
        _mediaUrlGeneratorCollection = mediaUrlGeneratorCollection;
    }

    [HttpGet("umbraco/zoo/import")]
    public async Task<IActionResult> ImportAnimals()
    {
        string jsonPath = @"x:\kasparboelkjeldsen\kjeldsen.dev\zoo\animals.json";
        
        if (!System.IO.File.Exists(jsonPath))
        {
            return NotFound($"File not found at {jsonPath}");
        }

        var jsonString = await System.IO.File.ReadAllTextAsync(jsonPath);
        using var doc = JsonDocument.Parse(jsonString);
        var root = doc.RootElement;
        
        if (!root.TryGetProperty("da", out var daArray))
        {
            return BadRequest("No 'da' property found in JSON.");
        }

        var contentParentGuid = Guid.Parse(AnimalContentContainer);
        var mediaParentGuid = Guid.Parse(AnimalMediaContainer);

        using var httpClient = new HttpClient();

        foreach (var item in daArray.EnumerateArray())
        {
            var prop = item.EnumerateObject().First();
            string animalName = prop.Name;
            var animalData = prop.Value;

            // Extract properties
            string type = animalData.TryGetProperty("type", out var t) ? t.GetString() : "";
            string habitat = animalData.TryGetProperty("habitat", out var h) ? h.GetString() : "";
            string diet = animalData.TryGetProperty("diet", out var d) ? d.GetString() : "";
            string lifespan = animalData.TryGetProperty("lifespan", out var l) ? l.GetString() : "";
            string description = animalData.TryGetProperty("description100words", out var desc) ? desc.GetString() : "";
            string imageUrl = animalData.TryGetProperty("image", out var img) ? img.GetString() : null;
            
            // Tags
            var tagsList = new List<string>();
            if (animalData.TryGetProperty("tags", out var tagsArray))
            {
                foreach(var tag in tagsArray.EnumerateArray()) tagsList.Add(tag.GetString());
            }
            
            // Colors
            string colorsJson = "";
            if (animalData.TryGetProperty("color-scheme", out var colorScheme))
            {
                colorsJson = colorScheme.GetRawText();
            }

            // Handle Image

            string mediaUdiString = null;
            if (!string.IsNullOrEmpty(imageUrl))
            {
                try 
                {
                    var imageBytes = System.IO.File.ReadAllBytes(@"x:\kasparboelkjeldsen\kjeldsen.dev\zoo\animals\" + animalName + ".jpg");
                    using var stream = new MemoryStream(imageBytes);
                    
                    var media = _mediaService.CreateMedia(animalName, mediaParentGuid, "Image");
                    media.SetValue(_mediaFileManager, _mediaUrlGeneratorCollection, _shortStringHelper, _contentTypeBaseServiceProvider, "umbracoFile", $"{animalName}.jpg", stream);
                    _mediaService.Save(media);
                    mediaUdiString = media.GetUdi().ToString();
                }
                catch (Exception)
                {
                    // Continue without image if download fails
                }
            }

            // Create Content
            var content = _contentService.Create(animalName, contentParentGuid, "animal");
            
            content.SetValue("type", type);
            content.SetValue("habitat", habitat);
            content.SetValue("diet", diet);
            content.SetValue("lifespan", lifespan);
            content.SetValue("description", description);
            content.SetValue("colors", colorsJson);
            content.SetValue("tags", string.Join(",", tagsList));
            
            if (mediaUdiString != null)
            {
                content.SetValue("image", mediaUdiString);
            }

            _contentService.Save(content);
            _contentService.Publish(content, []);
        }

        return Ok("Imported Danish animals successfully.");
    }
}