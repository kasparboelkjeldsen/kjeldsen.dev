using kjeldsen.backend.code.delivery.Provider;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DeliveryApi;

namespace kjeldsen.backend.code.delivery;

public class Delivery : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddSingleton<IApiMediaUrlProvider, AbsolutePathApiUrlProvider>();
    }
}