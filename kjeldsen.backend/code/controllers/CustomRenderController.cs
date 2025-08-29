using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;

namespace kjeldsen.backend.code.controllers;

public class CustomRenderController : RenderController
{
    public CustomRenderController(ILogger<RenderController> logger, ICompositeViewEngine compositeViewEngine, IUmbracoContextAccessor umbracoContextAccessor) : base(logger, compositeViewEngine, umbracoContextAccessor)
    {
    }

    public override IActionResult Index()
    {
        
        return Redirect("http://localhost:3000");
        return base.Index();
    }
}
