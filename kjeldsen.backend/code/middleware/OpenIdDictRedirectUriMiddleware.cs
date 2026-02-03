namespace kjeldsen.backend.code.middleware;

public class OpenIdDictRedirectUriMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _connectionString;
    private readonly string[] _requiredUris;

    public OpenIdDictRedirectUriMiddleware(
        RequestDelegate next,
        IConfiguration configuration)
    {
        _next = next;
        _connectionString = configuration["ConnectionStrings:umbracoDbDSN"] ?? string.Empty;
        _requiredUris = configuration.GetSection("OpenIdDictExtensions:RedirectUris").Get<string[]>() ?? [];
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Check on /umbraco/login requests
        if (context.Request.Path.StartsWithSegments("/umbraco/login", StringComparison.OrdinalIgnoreCase) || context.Request.Path == "/umbraco/" || context.Request.Path == "/umbraco")
        {
            if (!string.IsNullOrEmpty(_connectionString) && _requiredUris.Length > 0)
            {
                // Ensure redirect URIs are present; runs synchronously to guarantee DB state before OpenIdDict handles request
                extensions.OpenIdDictExtensions.EnsureRedirectUrisPresent(_connectionString, _requiredUris);
            }
        }

        await _next(context);
    }
}

public static class OpenIdDictRedirectUriMiddlewareExtensions
{
    public static IApplicationBuilder UseOpenIdDictRedirectUriCheck(this IApplicationBuilder app)
    {
        return app.UseMiddleware<OpenIdDictRedirectUriMiddleware>();
    }
}
