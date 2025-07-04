using kjeldsen.backend.code.notifications.ContentSaved;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Notifications;

namespace kjeldsen.backend.code.notifications;

public class Notifications : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.AddNotificationAsyncHandler<ContentPublishedNotification, ContentPublishedCacheKeyLogger>();
    }
}
