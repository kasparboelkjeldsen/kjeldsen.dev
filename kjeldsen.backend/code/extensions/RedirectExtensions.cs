namespace kjeldsen.backend.code.extensions;

public static class RedirectExtensions
{
    public static WebApplication AddStaticRedirects(this WebApplication app)
    {
        app.Use(async (context, next) =>
        {
            if (context.Request.Path == "/")
            {
                var redirectTo = "https://kjeldsen.dev";

#if DEBUG
                redirectTo = "/umbraco";
#endif

                context.Response.Redirect(redirectTo);
                return;
            }
            await next();
        });

        return app;
    }

    /// <summary>
    /// Engage analytics pageview tracking endpoint to the custom POC endpoint.
    /// Keeps the HTTP method/body intact (internal rewrite, not a redirect).
    /// </summary>
    public static WebApplication AddEngageTrackingRewrite(this WebApplication app)
    {
        app.Use(async (context, next) =>
        {
            if (context.Request.Path.Equals("/umbraco/engage/api/v1/analytics/pageview/trackpageview/server", StringComparison.OrdinalIgnoreCase))
            {
                context.Request.Path = "/umbraco/engageextensions/pageview/register";
            }
            await next();
        });
        return app;
    }
}
