using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using Azure.Storage.Blobs;
using kjeldsen.backend.code.mcp;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace kjeldsen.backend.code.extensions;

public static class McpAuthExtensions
{
    /// <summary>
    /// Registers bearer-token auth against the shared UmbracoDeliveryKey secret,
    /// an "McpAccess" authorization policy, and the keyed BlobContainerClient for note storage.
    /// Secrets are injected by AddSecrets() before this runs.
    /// </summary>
    public static WebApplicationBuilder AddNoteCaptureService(this WebApplicationBuilder builder)
    {
        builder.Services
            .AddAuthentication()
            .AddScheme<AuthenticationSchemeOptions, McpBearerHandler>("Mcp", _ => { });

        builder.Services.AddAuthorization(options =>
            options.AddPolicy("McpAccess", policy =>
            {
                policy.AddAuthenticationSchemes("Mcp");
                policy.RequireAuthenticatedUser();
            }));

        builder.Services.AddKeyedSingleton<BlobContainerClient>("mcp-notes", (sp, _) =>
        {
            var config = sp.GetRequiredService<IConfiguration>();
            var connectionString = config["NoteCaptureService:BlobConnectionString"]
                ?? throw new InvalidOperationException("NoteCaptureService:BlobConnectionString is not configured.");
            var containerName = config["NoteCaptureService:ContainerName"] ?? "memory";
            var client = new BlobContainerClient(connectionString, containerName);
            client.CreateIfNotExists();
            return client;
        });

        return builder;
    }
}

/// <summary>
/// Validates requests to /mcp by comparing the Authorization: Bearer value against
/// the configured secret using a constant-time comparison to prevent timing attacks.
/// </summary>
file sealed class McpBearerHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authHeader = Request.Headers.Authorization.FirstOrDefault();
        if (authHeader is null || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return Task.FromResult(AuthenticateResult.NoResult());

        var provided = Encoding.UTF8.GetBytes(authHeader["Bearer ".Length..].Trim());
        var expected = Encoding.UTF8.GetBytes(
            Context.RequestServices.GetRequiredService<IConfiguration>()
                ["NoteCaptureService:BearerToken"] ?? string.Empty);

        if (provided.Length == 0 || !CryptographicOperations.FixedTimeEquals(provided, expected))
            return Task.FromResult(AuthenticateResult.Fail("Invalid bearer token."));

        var principal = new ClaimsPrincipal(
            new ClaimsIdentity([new Claim(ClaimTypes.Name, "claude-chat")], Scheme.Name));

        return Task.FromResult(
            AuthenticateResult.Success(new AuthenticationTicket(principal, Scheme.Name)));
    }
}
