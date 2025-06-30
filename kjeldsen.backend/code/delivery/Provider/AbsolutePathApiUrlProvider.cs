using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;

namespace kjeldsen.backend.code.delivery.Provider;


public class AbsolutePathApiUrlProvider : IApiMediaUrlProvider
{
    private readonly IPublishedUrlProvider _publishedUrlProvider;

    public AbsolutePathApiUrlProvider(IPublishedUrlProvider publishedUrlProvider)
        => _publishedUrlProvider = publishedUrlProvider;

    public string GetUrl(IPublishedContent media)
        => media.ItemType is PublishedItemType.Media
            ? $"/api{_publishedUrlProvider.GetMediaUrl(media, UrlMode.Relative)}" : string.Empty;
}