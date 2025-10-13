using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Services.Navigation;
using Umbraco.Cms.Core.Web;

namespace kjeldsen.backend.code.engage.ContentFinders;

public class HeadlessContentFinder : IContentFinder
{
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IDocumentUrlService _documentUrlService;
    private readonly IDocumentNavigationQueryService _documentNavigationQueryService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    public HeadlessContentFinder(IUmbracoContextAccessor umbracoContextAccessor, IDocumentUrlService documentUrlService, IDocumentNavigationQueryService documentNavigationQueryService, IHttpContextAccessor httpContextAccessor)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _documentUrlService = documentUrlService;
        _documentNavigationQueryService = documentNavigationQueryService;
        _httpContextAccessor = httpContextAccessor;
    }
    public Task<bool> TryFindContent(IPublishedRequestBuilder request)
    {
        var context = _httpContextAccessor.HttpContext;
        var endpoint = context?.GetEndpoint();

        if (endpoint == null || endpoint.DisplayName == null) 
            return Task.FromResult(false);

        if(!endpoint.DisplayName.EndsWith("(Umbraco.Engage.Headless)") && endpoint.DisplayName != "kjeldsen.backend.code.engage.Api.CustomPageViewApiController.TrackPageView (kjeldsen.backend)")
        {
            return Task.FromResult(false);
        }

        _umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext);

        if (umbracoContext == null)
            return Task.FromResult(false);
        
        _documentNavigationQueryService.TryGetRootKeys(out var rootKeys);

        if (rootKeys == null || !rootKeys.Any())
            return Task.FromResult(false);

        foreach(var key in rootKeys)
        {
            var root = umbracoContext.Content.GetById(key);

            var docs = _documentUrlService.GetDocumentKeyByRoute(request.AbsolutePathDecoded, null, root!.Id, false);

            if (docs != null)
            {

                var content = umbracoContext.Content.GetById(docs.Value);

                request.SetPublishedContent(content);

                return Task.FromResult(true);
            }
        }
        return Task.FromResult(false);


    }
}

public class HeadlessContentFinderComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddTransient<IContentFinder, HeadlessContentFinder>();
        builder.ContentFinders().InsertBefore<ContentFinderByPageIdQuery, HeadlessContentFinder>();
    }
}