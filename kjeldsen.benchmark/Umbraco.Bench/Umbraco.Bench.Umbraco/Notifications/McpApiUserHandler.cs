using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Services.OperationStatus;

namespace Umbraco.Bench.Umbraco.Notifications;

// Provisions a local-only API user ("MCPUSER") so every developer who pulls the project
// has a working Umbraco MCP server (.mcp.json) with zero setup. The client secret is
// deliberately committed: it is only ever valid in Development/Local environments.
// Hardening: on any OTHER environment this handler removes the user if it exists
// (covers dev databases that get copied to staging/production) — deleted when possible,
// disabled when Umbraco refuses (login history), credentials revoked either way.
public class McpApiUserHandler(
    IHostEnvironment hostEnvironment,
    IRuntimeState runtimeState,
    IUserService userService,
    IBackOfficeUserClientCredentialsManager clientCredentialsManager,
    ILogger<McpApiUserHandler> logger)
    : INotificationAsyncHandler<UmbracoApplicationStartedNotification>
{
    public const string ClientId = "umbraco-back-office-mcp-local-only";
    public const string ClientSecret = "mcp-local-dev-secret-b3ll4b00t-not-a-real-secret"; // gitleaks:allow — local/dev only, see .gitleaksignore

    public async Task HandleAsync(UmbracoApplicationStartedNotification notification, CancellationToken cancellationToken)
    {
        if (runtimeState.Level != RuntimeLevel.Run)
            return;

        var isLocal = hostEnvironment.IsDevelopment() || hostEnvironment.IsEnvironment("Local");
        var existingUser = await clientCredentialsManager.FindUserAsync(ClientId);

        if (!isLocal)
        {
            if (existingUser is not null)
            {
                var deleteStatus = await userService.DeleteAsync(Constants.Security.SuperUserKey, existingUser.Key);
                if (deleteStatus != UserOperationStatus.Success)
                    await userService.DisableAsync(Constants.Security.SuperUserKey, new HashSet<Guid> { existingUser.Key });

                // Revoking the credentials is what actually cuts off MCP token grants
                await clientCredentialsManager.DeleteAsync(existingUser.Key, ClientId);

                logger.LogWarning("Removed local-only MCP API user (client id {ClientId}, delete: {Status}) — this environment is {Environment}, not Development/Local.", ClientId, deleteStatus, hostEnvironment.EnvironmentName);
            }
            return;
        }

        if (existingUser is not null)
            return;

        // A non-local cleanup leaves a disabled, credential-less MCPUSER behind (Umbraco
        // refuses to delete users with login history) — re-enable it rather than fail on
        // a duplicate email when the database comes back to a developer machine.
        Guid userKey;
        var orphan = userService.GetByUsername("mcpuser@example.com");
        if (orphan is not null)
        {
            await userService.EnableAsync(Constants.Security.SuperUserKey, new HashSet<Guid> { orphan.Key });
            userKey = orphan.Key;
        }
        else
        {
            var createAttempt = await userService.CreateAsync(Constants.Security.SuperUserKey, new UserCreateModel
            {
                UserName = "mcpuser@example.com",
                Name = "MCPUSER",
                Email = "mcpuser@example.com",
                Kind = UserKind.Api,
                UserGroupKeys = new HashSet<Guid> { Constants.Security.AdminGroupKey },
            }, approveUser: true);

            if (!createAttempt.Success)
            {
                logger.LogWarning("Could not create the MCP API user: {Status}", createAttempt.Status);
                return;
            }

            userKey = createAttempt.Result.CreatedUser!.Key;
        }

        var saveAttempt = await clientCredentialsManager.SaveAsync(userKey, ClientId, ClientSecret);
        if (saveAttempt.Success)
            logger.LogInformation("Provisioned local MCP API user (client id {ClientId}) — .mcp.json works out of the box.", ClientId);
        else
            logger.LogWarning("MCP API user created but client credentials failed: {Status}", saveAttempt.Result);
    }
}
