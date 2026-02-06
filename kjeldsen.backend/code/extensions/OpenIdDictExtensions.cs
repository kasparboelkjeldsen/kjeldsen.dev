using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace kjeldsen.backend.code.extensions;

public static class OpenIdDictExtensions
{
    public static WebApplicationBuilder AddOpenIdDictRedirectUris(this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration["ConnectionStrings:umbracoDbDSN"];
        var redirectUris = builder.Configuration.GetSection("OpenIdDictExtensions:RedirectUris").Get<string[]>();

        if (string.IsNullOrEmpty(connectionString) || redirectUris == null || redirectUris.Length == 0)
            return builder;

        UpdateRedirectUris(connectionString, redirectUris);

        return builder;
    }

    internal static void UpdateRedirectUris(string connectionString, string[] redirectUris)
    {
        var redirectUrisJson = JsonSerializer.Serialize(redirectUris);

        using var connection = new SqlConnection(connectionString);
        connection.Open();

        // Get current RedirectUris
        using var selectCmd = new SqlCommand(
            "SELECT Id, RedirectUris FROM umbracoOpenIddictApplications WHERE ClientId = 'umbraco-back-office'",
            connection);

        using var reader = selectCmd.ExecuteReader();
        if (!reader.Read())
            return;

        // Id is stored as VARCHAR containing a GUID string in this schema
        var idString = reader.GetString(0);
        var id = Guid.Parse(idString);
        var currentUris = reader.IsDBNull(1) ? "[]" : reader.GetString(1);
        reader.Close();

        // Parse current URIs and check if update needed
        var currentList = JsonSerializer.Deserialize<string[]>(currentUris) ?? [];
        var requiredSet = new HashSet<string>(redirectUris, StringComparer.OrdinalIgnoreCase);
        var currentSet = new HashSet<string>(currentList, StringComparer.OrdinalIgnoreCase);

        if (requiredSet.IsSubsetOf(currentSet))
            return; // All required URIs already present

        // Merge: keep existing + add missing required
        var merged = currentSet.Union(requiredSet).ToArray();
        var mergedJson = JsonSerializer.Serialize(merged);

        using var updateCmd = new SqlCommand(
            "UPDATE umbracoOpenIddictApplications SET RedirectUris = @uris WHERE Id = @id",
            connection);
        updateCmd.Parameters.AddWithValue("@uris", mergedJson);
        updateCmd.Parameters.AddWithValue("@id", id);
        updateCmd.ExecuteNonQuery();
    }

    internal static bool EnsureRedirectUrisPresent(string connectionString, string[] requiredUris)
    {
        using var connection = new SqlConnection(connectionString);
        connection.Open();

        using var selectCmd = new SqlCommand(
            "SELECT RedirectUris FROM umbracoOpenIddictApplications WHERE ClientId = 'umbraco-back-office'",
            connection);

        var result = selectCmd.ExecuteScalar();
        if (result == null || result == DBNull.Value)
        {
            UpdateRedirectUris(connectionString, requiredUris);
            return true;
        }

        var currentUris = (string)result;
        var currentList = JsonSerializer.Deserialize<string[]>(currentUris) ?? [];
        var currentSet = new HashSet<string>(currentList, StringComparer.OrdinalIgnoreCase);
        var requiredSet = new HashSet<string>(requiredUris, StringComparer.OrdinalIgnoreCase);

        if (requiredSet.IsSubsetOf(currentSet))
            return false; // No update needed

        UpdateRedirectUris(connectionString, requiredUris);
        return true;
    }
}
