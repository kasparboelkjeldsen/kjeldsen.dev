using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common;

namespace kjeldsen.backend.code.controllers;


[ApiController]
[Route("api/slug")]
public class SlugController : Controller
{
    private readonly IUmbracoHelperAccessor _umbracoHelperAccessor;
    public SlugController(IUmbracoHelperAccessor umbracoHelperAccessor)
    {
        _umbracoHelperAccessor = umbracoHelperAccessor;
    }

    [HttpGet]
    public ActionResult Get()
    {
        _umbracoHelperAccessor.TryGetUmbracoHelper(out var umbracoHelper);

        if (umbracoHelper == null)
        {
            return NotFound("Umbraco helper not available.");
        }

        var pages = umbracoHelper.ContentAtRoot().FirstOrDefault(x => x.Name == "kjeldsen.dev")?.DescendantsOrSelf();

        if (pages == null)
        {
            return NotFound("No pages found.");
        }

        var slugs = pages.Select(x => x.Url()).ToList();
        slugs = slugs.Where(x => !x.StartsWith("/writers")).ToList();
        return Ok(slugs);
    }
}
