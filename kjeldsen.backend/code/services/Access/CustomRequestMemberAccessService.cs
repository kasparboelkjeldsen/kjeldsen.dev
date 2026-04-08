using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using OpenIddict.Abstractions;
using OpenIddict.Validation.AspNetCore;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace kjeldsen.backend.code.services.Access;

internal sealed class CustomRequestMemberAccessService : IRequestMemberAccessService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IPublicAccessService _publicAccessService;
    private readonly IUserGroupService _userGroupService;
    private readonly IPublicAccessChecker _publicAccessChecker;
    private readonly DeliveryApiSettings _deliveryApiSettings;
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;

    public CustomRequestMemberAccessService(
        IHttpContextAccessor httpContextAccessor,
        IPublicAccessService publicAccessService,
        IPublicAccessChecker publicAccessChecker,
        IOptions<DeliveryApiSettings> deliveryApiSettings,
        IUserService userService,
        IUserGroupService userGroupService,
        IConfiguration configuration)
    {
        _httpContextAccessor = httpContextAccessor;
        _publicAccessService = publicAccessService;
        _publicAccessChecker = publicAccessChecker;
        _deliveryApiSettings = deliveryApiSettings.Value;
        _userService = userService;
        _configuration = configuration;
        _userGroupService = userGroupService;
    }

    public async Task<ProtectedAccess> MemberAccessAsync()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext is not null)
        {
            var apiKey = _configuration["Umbraco:CMS:DeliveryApi:ApiKey"];
            var provided = httpContext.Request.Headers["Api-Key"].ToString();

            if (string.IsNullOrEmpty(provided) || provided != apiKey)
                return new ProtectedAccess(null, null);
        }

        ClaimsPrincipal? requestPrincipal = await GetRequestPrincipal();
        return new ProtectedAccess(MemberKey(requestPrincipal), MemberRoles(requestPrincipal));
    }

    public async Task<PublicAccessStatus> MemberHasAccessToAsync(IPublishedContent content)
    {
        if (IsPubliclyTagged(content))
            return PublicAccessStatus.AccessAccepted;

        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext is null)
            return PublicAccessStatus.AccessDenied;

        if (IsAuthenticatedBackofficeUser(httpContext.User))
            return BackofficeUserHasAccess(httpContext.User, content);

        if (!HasValidApiKey(httpContext))
            return PublicAccessStatus.AccessDenied;

        return await MemberAccessViaPublicAccessAsync(content);
    }

    private static bool IsPubliclyTagged(IPublishedContent content)
        => content.Value<string?>("seoKeywords")?.Contains("public-delivery-access") == true;

    private static bool IsAuthenticatedBackofficeUser(ClaimsPrincipal principal)
        => principal.Identity?.AuthenticationType == "UmbracoBackOffice"
           && principal.Identity.IsAuthenticated;

    private PublicAccessStatus BackofficeUserHasAccess(ClaimsPrincipal principal, IPublishedContent content)
    {
        var userKeyStr = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? principal.FindFirstValue("sub");

        if (!int.TryParse(userKeyStr, out var userKey))
            return PublicAccessStatus.AccessDenied;

        var user = _userService.GetUserById(userKey);
        if (user is null)
            return PublicAccessStatus.AccessDenied;

        foreach (var group in user.Groups)
        {
            if (group.Permissions.Any(p => p == "Umb.Document.Read"))
                return PublicAccessStatus.AccessAccepted;

            if (group.GranularPermissions.Any(p =>
                    p.Context == "Document" &&
                    p.Permission == "Umb.Document.Read" &&
                    p.Key == content.Key))
                return PublicAccessStatus.AccessAccepted;
        }

        return PublicAccessStatus.AccessDenied;
    }

    private bool HasValidApiKey(HttpContext httpContext)
    {
        var apiKey = _configuration["Umbraco:CMS:DeliveryApi:ApiKey"];
        var provided = httpContext.Request.Headers["Api-Key"].ToString();
        return !string.IsNullOrEmpty(provided) && provided == apiKey;
    }

    private async Task<PublicAccessStatus> MemberAccessViaPublicAccessAsync(IPublishedContent content)
    {
        var publicAccessEntry = _publicAccessService.GetEntryForContent(content.Path);
        if (publicAccessEntry is null)
            return PublicAccessStatus.AccessAccepted;

        var requestPrincipal = await GetRequestPrincipal();
        if (requestPrincipal is null)
            return PublicAccessStatus.NotLoggedIn;

        return await _publicAccessChecker.HasMemberAccessToContentAsync(content.Id, requestPrincipal);
    }

    private async Task<ClaimsPrincipal?> GetRequestPrincipal()
    {
        if (_deliveryApiSettings.MemberAuthorizationIsEnabled() is false)
            return null;

        HttpContext httpContext = _httpContextAccessor.GetRequiredHttpContext();
        AuthenticateResult result = await httpContext.AuthenticateAsync(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);
        return result.Succeeded
            ? result.Principal
            : null;
    }

    private static Guid? MemberKey(ClaimsPrincipal? claimsPrincipal)
        => claimsPrincipal is not null && Guid.TryParse(claimsPrincipal.GetClaim(Constants.OAuthClaims.MemberKey), out Guid memberKey)
            ? memberKey
            : null;

    private static string[]? MemberRoles(ClaimsPrincipal? claimsPrincipal)
        => claimsPrincipal?.GetClaim(Constants.OAuthClaims.MemberRoles)?.Split(Constants.CharArrays.Comma);
}

public class CustomRequestMemberAccessServiceComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Replace(ServiceDescriptor.Transient<IRequestMemberAccessService, CustomRequestMemberAccessService>());
    }
}
