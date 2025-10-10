using System.Net;
using System.Text.Json.Nodes;
using kjeldsen.backend.code.engage.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Umbraco.Engage.Data.Analytics.Collection.ClientSide;
using Umbraco.Engage.Data.Analytics.Processed.Visitor;
using Umbraco.Engage.Infrastructure.Analytics.Collection.Extractors;
using Umbraco.Engage.Infrastructure.Analytics.Collection.Visitor;
using Umbraco.Engage.Infrastructure.Analytics.IpFilters;
using Umbraco.Engage.Infrastructure.Analytics.Processing.ClientSideData;
using Umbraco.Engage.Infrastructure.Common;
using Umbraco.Engage.Infrastructure.Personalization.PersonalizationProfile;
using Umbraco.Engage.Web.Api.Controllers.PageData;

namespace kjeldsen.backend.code.engage.api;

[ApiController]
[Route("umbraco/engageextensions/pagedata")]
public class HeadlessPageDataController : PageDataControllerBase
{
    private readonly IUmbracoEngageContext _context;
    private readonly IRawClientSideDataRepository _rawClientSideDataRepository;
    public HeadlessPageDataController(
    IHttpContextIpAddressExtractor ipAddressExtractor,
    IIpFiltersRepository ipFiltersRepository,
    IUmbracoEngageContext context,
    IAnalyticsVisitorExternalIdHandler externalIdHandler,
    IPersonalizationVisitorProfileAccessor visitorProfileAccessor,
    IRawClientSideDataRepository rawClientSideDataRepository,
    IClientSideDataDeserializer clientSideDataDeserializer)
    : base(ipAddressExtractor, ipFiltersRepository, externalIdHandler, visitorProfileAccessor, clientSideDataDeserializer)
    {
        _context = context;
        _rawClientSideDataRepository = rawClientSideDataRepository;
    }

    [HttpPost("collect")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Collect([FromBody] ClientCollectDto collection)
    {
        if (_context.IsEnabled && collection.ExternalVisitorId != null && collection.Version != null && collection.PageViewGuid != null)
        {
            if (HttpContext != null && !IpIsExcluded(HttpContext))
            {
                Guid externalId = Guid.Parse(collection.ExternalVisitorId);
                Guid pageViewId = Guid.Parse(collection.PageViewGuid);

                var version = int.Parse(collection.Version);
                PersonalizationVisitorProfile? personalizationVisitorProfile = VisitorProfileAccessor.EnsureVisitorProfile(externalId);
                if (personalizationVisitorProfile != null && personalizationVisitorProfile.VisitorType == VisitorType.Person)
                {
                    string json = JsonConvert.SerializeObject(collection);
                    RawClientSideData data = new RawClientSideData(DateTime.UtcNow, json, version, pageViewId);
                    _rawClientSideDataRepository.Insert(data);
                    SendClientSideDataReceivedEvent(HttpContext, json, version);
                }
            }
        }

        return NoContent();
    }
}
