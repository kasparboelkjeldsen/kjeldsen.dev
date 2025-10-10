using Microsoft.Extensions.DependencyInjection; // for AddOptions extensions
using Umbraco.Cms.Core.Composing;

namespace kjeldsen.backend.code.engage.Options;

public class EngageExtensionsOptionsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // Bind the configuration section "EngageExtensions" to the (unnamed) EngageExtensionsOptions instance
        // so that injecting IOptions<EngageExtensionsOptions> yields the configured values.
        builder.Services
            .AddOptions<EngageExtensionsOptions>()
            .Bind(builder.Config.GetSection("EngageExtensions"))
            .ValidateOnStart();
    }
}
