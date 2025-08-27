using kraftvaerk.umbraco.blockfilter.Backend.Notifications;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Services;

namespace kjeldsen.backend.code.blockfilter;

public class YourNotificationHandler : INotificationAsyncHandler<RemodelBlockCatalogueNotification>
{
    private readonly IContentService _contentService;
    public YourNotificationHandler(IContentService contentService)
    {
        _contentService = contentService;
    }

    public async Task HandleAsync(RemodelBlockCatalogueNotification notification, CancellationToken cancellationToken)
    {
        var id = notification.Model.ContentId;

        if(id == null)
        {
            return;
        }

        var name = _contentService.GetById(Guid.Parse(id)).Name;
        
        if(!name.Equals("umbraco packages", StringComparison.OrdinalIgnoreCase))
        {
            notification.Model.Blocks = notification.Model.Blocks.Where(x => x.Alias != "cacheKeyExampleBlock").ToList();
        }
    }
}

public class YourComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.AddNotificationAsyncHandler<RemodelBlockCatalogueNotification, YourNotificationHandler>();
    }
}