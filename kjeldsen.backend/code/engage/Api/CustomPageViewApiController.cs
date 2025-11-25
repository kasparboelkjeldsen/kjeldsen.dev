using kjeldsen.backend.code.engage.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json.Linq;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Services.Navigation;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Engage.Data.Personalization.AppliedPersonalizations;
using Umbraco.Engage.Headless.Api.v1;
using Umbraco.Engage.Headless.Api.v1.Analytics;
using Umbraco.Engage.Headless.Common.HeadlessHttpContext;
using Umbraco.Engage.Headless.Common.Requests;
using Umbraco.Engage.Headless.Common.Responses;
using Umbraco.Engage.Headless.Services;
using Umbraco.Engage.Infrastructure.Analytics.Processed;
using Umbraco.Engage.Infrastructure.Permissions.ModulePermissions;
using Umbraco.Engage.Infrastructure.Personalization;
using Umbraco.Engage.Infrastructure.Personalization.AppliedPersonalizations;
using Umbraco.Engage.Infrastructure.Personalization.ControlGroups;
using Umbraco.Engage.Infrastructure.Personalization.Personas;
using Umbraco.Engage.Infrastructure.Personalization.Segments;

namespace kjeldsen.backend.code.engage.Api;

[ApiController]
[Route("umbraco/engageextensions/pageview")]
public class CustomPageViewApiController : MarketingApiControllerBase
{
    private readonly IHeadlessPageViewService _headlessPageViewService;
    private readonly Umbraco.Engage.Infrastructure.Personalization.Segments.ISegmentService _segmentService;
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IDocumentNavigationQueryService _documentNavigationQueryService;
    private readonly IDocumentUrlService _documentUrlService;
    private readonly IActiveSegmentService _activeSegmentService;
    private readonly ModulePermissionsService _modulePermissionsService;
    private readonly IPersonalizationSegmentNameProvider _personalizationSegmentNameProvider;
    private readonly IAppliedPersonalizationRepository _appliedPersonalizationRepository;
    private readonly IPersonalizationControlGroupService _personalizationControlGroupService;
    private readonly IUmbracoDatabaseFactory _umbracoDatabaseFactory;
    private readonly IMemoryCache _cache;
    private readonly IPersonaGroupRepository _personaGroupRepository;

    public CustomPageViewApiController(
        IApiPublishedContentCache apiPublishedContentCache, 
        IPublicAccessService publicAccessService, 
        IRequestRoutingService requestRoutingService, 
        IHeadlessPageViewService headlessPageViewService,
        IUmbracoContextAccessor umbracoContextAccessor,
        IDocumentNavigationQueryService documentNavigationQueryService,
        IDocumentUrlService documentUrlService,
        IActiveSegmentService activeSegmentService,
        ModulePermissionsService modulePermissionsService,
        IPersonalizationSegmentNameProvider personalizationSegmentNameProvider,
        IAppliedPersonalizationRepository appliedPersonalizationRepository,
        IPersonalizationControlGroupService personalizationControlGroupService,
        IUmbracoDatabaseFactory umbracoDatabaseFactory,
        IPersonaGroupRepository personaGroupRepository,
        Umbraco.Engage.Infrastructure.Personalization.Segments.ISegmentService segmentService,
        IMemoryCache cache) : base(apiPublishedContentCache, publicAccessService, requestRoutingService)
    {
        _headlessPageViewService = headlessPageViewService;
        _segmentService = segmentService;
        _umbracoContextAccessor = umbracoContextAccessor;
        _documentNavigationQueryService = documentNavigationQueryService;
        _documentUrlService = documentUrlService;
        _activeSegmentService = activeSegmentService;
        _modulePermissionsService = modulePermissionsService;
        _personalizationSegmentNameProvider = personalizationSegmentNameProvider;
        _appliedPersonalizationRepository = appliedPersonalizationRepository;
        _personalizationControlGroupService = personalizationControlGroupService;
        _umbracoDatabaseFactory = umbracoDatabaseFactory;
        _personaGroupRepository = personaGroupRepository;
        _cache = cache;
    }

    [HttpGet]
    [Route("scores")]
    public async Task<IActionResult> GetPersonaScores(Guid externalVisitorId)
    {
        var scores = _personaGroupRepository.GetPersonaScoresByVisitor(externalVisitorId);
        return Ok(scores);
    }


    [HttpGet]
    [Route("rules")]
    public async Task<IActionResult> GetRulesFromPageId(string path)
    {
        // Clean incoming path: strip domain + query string, ensure leading '/'
        string CleanPath(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return "/";
            if (Uri.TryCreate(raw, UriKind.Absolute, out var abs))
            {
                return string.IsNullOrWhiteSpace(abs.AbsolutePath) ? "/" : abs.AbsolutePath;
            }
            var qIndex = raw.IndexOf('?', StringComparison.Ordinal);
            if (qIndex >= 0) raw = raw[..qIndex];
            if (!raw.StartsWith('/')) raw = "/" + raw;
            return raw;
        }
        var cleanedPath = CleanPath(path);

        // Cache key based on cleaned path
        var cacheKey = $"rules::{cleanedPath}";
        if (_cache.TryGetValue(cacheKey, out string cachedJson))
        {
            return Ok(cachedJson); // return cached serialized JSON
        }

        _umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext);
        if (umbracoContext == null)
            return NotFound("Umbraco context unavailable");

        _documentNavigationQueryService.TryGetRootKeys(out var rootKeys);
        Guid? pageId = null;
        foreach (var key in rootKeys)
        {
            var root = umbracoContext.Content.GetById(key);
            if (root == null) continue;
            var docKey = _documentUrlService.GetDocumentKeyByRoute(cleanedPath, null, root.Id, false);
            if (docKey == null) continue;
            pageId = docKey.Value;
            break;
        }
        if (!pageId.HasValue)
            return NotFound("No document found for path");

        using var db = _umbracoDatabaseFactory.CreateDatabase();

        var sql = @"select top 1 rules.config, personal.id as personalizationId from 
	umbracoEngagePersonalizationAppliedPersonalizationUmbracoPageVariant variant, 
	umbracoEngagePersonalizationAppliedPersonalization personal,
	umbracoEngagePersonalizationSegment segment,
	umbracoEngagePersonalizationSegmentRule rules
where variant.[key] = @key
and personal.id = variant.personalizationId
and segment.id = personal.segmentId
and rules.segmentId = segment.id";

        var row = db.Query<(string Config, int PersonalizationId)>(sql, new { key = pageId.Value }).FirstOrDefault();
        if (row.Config == null)
        {
            _cache.Set(cacheKey, "{}", TimeSpan.FromMinutes(1));
            return Ok("{}");
        }

        var obj = JObject.Parse(row.Config);
        obj["personalizationId"] = row.PersonalizationId;
        var resultJson = obj.ToString();

        // Cache for 1 minute
        _cache.Set(cacheKey, resultJson, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(1)
        });

        return Ok(resultJson);
    }

    [HttpPost]
    [Route("register")]
    [Tags(new string[] { "External-Visitor-Id" })]
    [ProducesResponseType(typeof(RemotePageViewResponseModel), 200)]
    [ProducesResponseType(typeof(StatusCodeResult), 500)]
    [ProducesResponseType(typeof(NotPermittedDueToLicenseResult), 402)]
    public async Task<IActionResult> TrackPageView(
    [FromBody] RemotePageViewServerRequestModel remotePageViewServer)
    {  

        var request = new HeadlessHttpContext(
            HttpContext, 
            Request, 
            remotePageViewServer.Url, 
            remotePageViewServer.ReferrerUrl, 
            remotePageViewServer.Headers, 
            remotePageViewServer.RemoteClientAddress, 
            remotePageViewServer.BrowserUserAgent, 
            remotePageViewServer.UserIdentifier);

        if (!_headlessPageViewService.IsAllowedToRegisterPageview(request))
            return new NotPermittedDueToLicenseResult();

        IPageview? pageview = await _headlessPageViewService.RegisterRemotePageView(request);
        string? activeSegment = null;
        if (pageview != null && pageview.ExternalId != null)
        {
            var externalVisitorString = pageview.ExternalId.ToString();
            _umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext);
            IPublishedContent? content = null;
            if (umbracoContext != null)
            {
                _documentNavigationQueryService.TryGetRootKeys(out var rootKeys);

                // Clean the incoming URL: strip domain + query string, ensure leading '/'
                string CleanPath(string? raw)
                {
                    if (string.IsNullOrWhiteSpace(raw)) return "/";
                    // Try absolute first
                    if (Uri.TryCreate(raw, UriKind.Absolute, out var abs))
                    {
                        return string.IsNullOrWhiteSpace(abs.AbsolutePath) ? "/" : abs.AbsolutePath;
                    }
                    // Remove query part manually for relative input
                    var qIndex = raw.IndexOf('?', StringComparison.Ordinal);
                    if (qIndex >= 0) raw = raw[..qIndex];
                    if (!raw.StartsWith('/')) raw = "/" + raw;
                    return raw;
                }

                var cleanedPath = CleanPath(remotePageViewServer.Url);

                foreach (var key in rootKeys)
                {
                    var root = umbracoContext.Content.GetById(key);
                    if (root == null) continue;

                    var docKey = _documentUrlService.GetDocumentKeyByRoute(cleanedPath, null, root.Id, false);
                    if (docKey == null) continue;

                    content = umbracoContext.Content.GetById(docKey.Value);
                    if (content != null) break;
                }
            }
            
            if(content != null)
            {
                HttpContext.Request.Headers.Append("External-Visitor-Id", externalVisitorString);
                var permissions = _modulePermissionsService.GetPermissions(request);

                

                if(permissions.AbTesting)
                {
                    // TODO: A/B testing logic placeholder
                }
                if(permissions.Personalization)
                {
                    if(pageview.PageviewSegments.Any())
                        activeSegment = GetActivePersonalizationSegment(request, content.Id, string.Empty, content.ContentType.Id, pageview);
                }
            }
        }

        return pageview == null ? new StatusCodeResult(500) : Ok(new RemotePageViewWithActiveSegmentResponseModel(pageview.ExternalId, new Guid?(pageview.Guid), activeSegment));
    }

    public string GetActivePersonalizationSegment(HttpContext httpContext, int contentId, string culture, int contentTypeId, IPageview pageview)
    {
        string key = $"{"Engage"}_{_personalizationSegmentNameProvider.UmbracoSegmentPrefix}_{contentId}_{culture}_{contentTypeId}";

        var appliedPersonalization = _appliedPersonalizationRepository.GetActive(contentId, culture, contentTypeId, pageview.PageviewSegments.Select((PageviewSegment pvs) => pvs.Segment), (AppliedPersonalization p) => p.Type == AppliedPersonalizationType.SinglePage);
        return appliedPersonalization != null ? appliedPersonalization.UmbracoSegmentAlias : string.Empty;
    }


}
