using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Infrastructure.DeliveryApi;
using Umbraco.Cms.Core.Notifications;

namespace kjeldsen.backend.code.graphics;

public sealed class GeneratedGraphicsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddSingleton<GeneratedGraphicsGenerator>();
        builder.AddNotificationAsyncHandler<MediaSavingNotification, GeneratedGraphicsSavingHandler>();
        builder.Services.Decorate<IApiMediaWithCropsBuilder, GeneratedGraphicsApiMediaBuilder>();
    }
}
