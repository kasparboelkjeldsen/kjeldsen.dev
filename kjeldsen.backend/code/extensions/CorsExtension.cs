using kjeldsen.backend.code.extensions;

namespace kjeldsen.backend.code.extensions;

public static class CorsExtension
{
    public static WebApplicationBuilder AddCors(this WebApplicationBuilder builder)
    {
        var allowedOrigins = new[]
        {
            "http://localhost",
            "https://localhost",
            "http://localhost:3000",        // Example port, add others as needed
            "https://localhost:3000",
            "https://*.kjeldsen.dev",       // Wildcards are not directly supported in ASP.NET Core CORS, see note below
            "http://*.kjeldsen.dev"
        };

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowLocalhostAndKjeldsenDev", policy =>
            {
                policy
                    .SetIsOriginAllowed(origin =>
                        origin.StartsWith("http://localhost") ||
                        origin.StartsWith("https://localhost") ||
                        origin.EndsWith("kjeldsen.dev"))
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return builder;
    }
}
