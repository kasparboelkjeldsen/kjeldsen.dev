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
}
