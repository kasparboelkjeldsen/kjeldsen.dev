using kraftvaerk.umbraco.blockfilter.Backend.Notifications;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Services;

namespace kjeldsen.backend.code.blockfilter;

// Narrows the block catalogue per page, so demo-only and post-only blocks are not offered
// everywhere the grid is used.
public class YourNotificationHandler : INotificationAsyncHandler<RemodelBlockCatalogueNotification>
{
    private readonly IContentService _contentService;
    public YourNotificationHandler(IContentService contentService)
    {
        _contentService = contentService;
    }

    public Task HandleAsync(RemodelBlockCatalogueNotification notification, CancellationToken cancellationToken)
    {
        var model = notification.Model;
        var content = Guid.TryParse(model.ContentId, out var key) ? _contentService.GetById(key) : null;
        var name = content?.Name ?? string.Empty;
        var type = content?.ContentType.Alias ?? model.ContentTypeAlias;

        // The cache-key demo prints the keys of the page it sits on: only the caching posts use it.
        var cacheKeyPage = name.Equals("umbraco packages", StringComparison.OrdinalIgnoreCase)
            || name.Contains("Caching");

        // A can-present deck belongs in a post, not on the home page or a content page.
        var blogPost = type == "blogPostPage";

        model.Blocks = model.Blocks
            .Where(x => x.Alias != "cacheKeyExampleBlock" || cacheKeyPage)
            .Where(x => x.Alias != "canPresentBlock" || blogPost)
            .ToList();

        return Task.CompletedTask;
    }
}

public class YourComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.AddNotificationAsyncHandler<RemodelBlockCatalogueNotification, YourNotificationHandler>();
    }
}
