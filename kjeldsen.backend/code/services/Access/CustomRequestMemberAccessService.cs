using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using OpenIddict.Validation.AspNetCore;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;

public class CustomRequestMemberAccessService(
    IRequestMemberAccessService inner,
    IHttpContextAccessor httpContextAccessor,
    IUserService userService) : IRequestMemberAccessService
{
    public Task<ProtectedAccess> MemberAccessAsync()
        => inner.MemberAccessAsync();

    public async Task<PublicAccessStatus> MemberHasAccessToAsync(IPublishedContent content)
    {
        var seoKeywords = content.Value<string?>("seoKeywords");

        if (seoKeywords?.Contains("public-delivery-access") == true)
            return PublicAccessStatus.AccessAccepted;

        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext is not null)
        {
            var principal = httpContext.User;
            var isBackofficeToken = principal.Identity?.AuthenticationType
                == OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;

            if (isBackofficeToken && principal.Identity?.IsAuthenticated == true)
            {
                var userKeyStr = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? principal.FindFirstValue("sub");

                if (Guid.TryParse(userKeyStr, out var userKey))
                {
                    var user = await userService.GetAsync(userKey);
                    if (user is not null)
                    {
                        var groupAliases = user.Groups.Select(g => g.Alias).ToHashSet();

                        if (groupAliases.Contains("apiAccessGroup"))
                            return PublicAccessStatus.AccessAccepted;
                    }
                }

                return PublicAccessStatus.AccessDenied;
            }
        }

        return await inner.MemberHasAccessToAsync(content);
    }
}

public class CustomRequestMemberAccessServiceComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Decorate<IRequestMemberAccessService, CustomRequestMemberAccessService>();
    }
}
