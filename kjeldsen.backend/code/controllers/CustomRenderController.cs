using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.Extensions.Caching.Memory;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Controllers;

namespace kjeldsen.backend.code.controllers;


public class CustomRenderController : RenderController
{
    private string previewPath = string.Empty;
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;
    private readonly IMemoryCache _memoryCache;
    public CustomRenderController(
        ILogger<RenderController> logger, 
        ICompositeViewEngine compositeViewEngine, 
        IUmbracoContextAccessor umbracoContextAccessor,
        IConfiguration configuration,
        IMemoryCache memoryCache, 
        IBackOfficeSecurityAccessor backOfficeSecurityAccessor) : base(logger, compositeViewEngine, umbracoContextAccessor)
    {
        this.previewPath = configuration.GetValue<string>("Nuxt:Host") + "/__preview";
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
        _memoryCache = memoryCache;
    }

    public override IActionResult Index()
    {
        if(_backOfficeSecurityAccessor.BackOfficeSecurity != null && _backOfficeSecurityAccessor.BackOfficeSecurity.IsAuthenticated())
        {
            var key = "custom-preview-"+_backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser?.Id;
            var secret = Guid.NewGuid();

            _memoryCache.Set(key, secret, TimeSpan.FromMinutes(1));

            var guidString = Request.Path.ToString().Replace("/", "");
            if(Guid.TryParse(guidString, out var guid))
            {
                return Redirect(this.previewPath + "?id=" + guid  + "&key=" + key);
            }
        }
        return Unauthorized();
    }
}

[ApiController]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("api/preview")]
public class PreviewController : Controller
{
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;
    private readonly IMemoryCache _memoryCache;
    public PreviewController(
        IBackOfficeSecurityAccessor backOfficeSecurityAccessor,
        IMemoryCache memoryCache)
    {
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
        _memoryCache = memoryCache;
    }
    [HttpGet("/check")]
    public IActionResult Index(Guid id, string key)
    {
        if (_backOfficeSecurityAccessor.BackOfficeSecurity != null && _backOfficeSecurityAccessor.BackOfficeSecurity.IsAuthenticated())
        {
            var cacheKey = "custom-preview-" + _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser?.Id;
            if (_memoryCache.TryGetValue(cacheKey, out Guid secret))
            {
                return Ok();
            }
        }
        return Unauthorized();
    }
}