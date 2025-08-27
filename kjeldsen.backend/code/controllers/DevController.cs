using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common;

namespace kjeldsen.backend.code.controllers;

[ApiController]
[Route("api/[controller]")]
public class DevController : Controller
{
    IUmbracoHelperAccessor _umbracoHelperAccessor;
    public DevController(IUmbracoHelperAccessor umbracoHelperAccessor)
    {
        _umbracoHelperAccessor = umbracoHelperAccessor;
    }

    [HttpGet("cropTest")]
    public IActionResult CropTest(string guid)
    {
        var umbracoHelper = _umbracoHelperAccessor.TryGetUmbracoHelper(out var helper) ? helper : throw new Exception("Could not get UmbracoHelper");
        var imageUrl = umbracoHelper.Media(guid)?.GetCropUrl(width: 1000, height: 250, preferFocalPoint: true);
        return Ok(new { imageUrl });
    }
}
