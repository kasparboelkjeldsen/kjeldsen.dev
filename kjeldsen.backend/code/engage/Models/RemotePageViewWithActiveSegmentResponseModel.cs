using Umbraco.Engage.Headless.Common.Responses;

namespace kjeldsen.backend.code.engage.Models;

public class RemotePageViewWithActiveSegmentResponseModel : RemotePageViewResponseModel
{
    public string? ActiveSegmentAlias { get; set; }
    public RemotePageViewWithActiveSegmentResponseModel(Guid? externalVisitorId, Guid? pageviewId, string? activeSegmentAlias) : base(externalVisitorId, pageviewId)
    {
        ActiveSegmentAlias = activeSegmentAlias;
    }
}
