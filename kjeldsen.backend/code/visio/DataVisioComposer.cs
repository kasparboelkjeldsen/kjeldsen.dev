using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Notifications;

namespace kjeldsen.backend.code.visio;

public sealed class DataVisioComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddSingleton<DataVisioGenerator>();
        builder.AddNotificationAsyncHandler<ContentSavingNotification, DataVisioSavingHandler>();
    }
}
