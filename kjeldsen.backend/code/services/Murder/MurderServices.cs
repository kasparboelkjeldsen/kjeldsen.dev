using Microsoft.Extensions.Configuration;
using NPoco;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;
using Umbraco.Cms.Infrastructure.Scoping;

namespace kjeldsen.backend.code.services;

public class MurderService : IMurderService
{
    private readonly IScopeProvider _scopeProvider;
    private readonly string _murderKey;

    public MurderService(IScopeProvider scopeProvider, IConfiguration configuration)
    {
        _scopeProvider = scopeProvider;
        _murderKey = configuration.GetSection("Nuxt:MurderKey").Value
            ?? throw new InvalidOperationException("MurderKey is not configured in appsettings.json");
    }

    public async Task RecordMurderAsync(string username, string? providedKey)
    {
        if (string.IsNullOrWhiteSpace(providedKey) || providedKey != _murderKey)
        {
            throw new UnauthorizedAccessException("Invalid or missing MurderKey.");
        }

        using var scope = _scopeProvider.CreateScope(autoComplete: true);
        var db = scope.Database;

        await db.InsertAsync(new WhoDidItDbRow
        {
            Username = username,
            Created = DateTime.UtcNow
        });
    }

    public async Task<IEnumerable<MurderRecord>> GetAllMurdersAsync()
    {
        using var scope = _scopeProvider.CreateScope(autoComplete: true);
        var db = scope.Database;

        var rows = await db.FetchAsync<WhoDidItDbRow>($"SELECT * FROM {WhoDidItDbRow.TableName} ORDER BY Created DESC");

        var result = new List<MurderRecord>();
        foreach (var row in rows)
        {
            result.Add(new MurderRecord
            {
                Id = row.Id,
                Username = row.Username,
                Created = row.Created
            });
        }

        return result;
    }

    public async Task ClearAllMurdersAsync()
    {
        using var scope = _scopeProvider.CreateScope(autoComplete: true);
        var db = scope.Database;

        await db.ExecuteAsync($"DELETE FROM {WhoDidItDbRow.TableName}");
    }

    [TableName(TableName)]
    [PrimaryKey("Id", AutoIncrement = true)]
    [ExplicitColumns]
    private class WhoDidItDbRow
    {
        public const string TableName = "kjeldsendev_whodidit";

        [PrimaryKeyColumn(AutoIncrement = true)]
        [Column("Id")]
        public int Id { get; set; }

        [Column("Username")]
        [Length(255)]
        public string? Username { get; set; }

        [Column("Created")]
        public DateTime Created { get; set; }
    }
}
