using Umbraco.AI.Core.Security;

namespace kjeldsen.backend.code.ai;

/// <summary>
/// Lets a local run use the production Umbraco.AI connection.
///
/// Umbraco.AI encrypts a connection's API key with ASP.NET Data Protection, whose key ring belongs
/// to the server that saved it. The local backend shares production's database, so it reads a
/// ciphertext it cannot decrypt; the stock protector logs a warning and returns the ciphertext
/// as-is, and Anthropic answers "invalid x-api-key". Re-saving the connection locally would
/// encrypt it with the local ring and break production the same way.
///
/// This decorator, registered only in Development, substitutes the key from user secrets
/// (<c>Umbraco:AI:DevelopmentApiKey</c>) whenever the real protector could not decrypt a value.
/// It is safe here because the site has one connection, so "a secret this machine cannot read"
/// is unambiguous. Protect is untouched: saving still works exactly as before, and the warning
/// above still applies to it.
/// </summary>
public sealed class DevelopmentAiKeyProtector(
    IAISensitiveFieldProtector inner,
    string developmentKey,
    ILogger<DevelopmentAiKeyProtector> logger) : IAISensitiveFieldProtector
{
    public string? Protect(string? value) => inner.Protect(value);

    public bool IsProtected(string? value) => inner.IsProtected(value);

    public string? Unprotect(string? value)
    {
        if (value is null || !inner.IsProtected(value)) return value;

        string? result;
        try
        {
            result = inner.Unprotect(value);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogDebug(ex, "Could not decrypt a protected AI field locally; using the development key");
            return developmentKey;
        }

        // The stock protector swallows the failure and hands the ciphertext back.
        if (inner.IsProtected(result) || result == value)
        {
            logger.LogDebug("A protected AI field did not decrypt locally; using the development key");
            return developmentKey;
        }
        return result;
    }
}

public static class DevelopmentAiKeyExtensions
{
    public const string ConfigurationKey = "Umbraco:AI:DevelopmentApiKey";

    /// <summary>
    /// Call after the Umbraco builder has run (so Umbraco.AI's services are registered). Does
    /// nothing outside Development or without the secret, so production is untouched.
    /// </summary>
    public static WebApplicationBuilder AddDevelopmentAiKey(this WebApplicationBuilder builder)
    {
        if (!builder.Environment.IsDevelopment()) return builder;

        var key = builder.Configuration[ConfigurationKey];
        if (string.IsNullOrWhiteSpace(key)) return builder;

        builder.Services.Decorate<IAISensitiveFieldProtector>((inner, services) =>
            new DevelopmentAiKeyProtector(inner, key, services.GetRequiredService<ILogger<DevelopmentAiKeyProtector>>()));
        return builder;
    }
}
