using Microsoft.Extensions.Logging;
using NPoco;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace kjeldsen.backend.code.migrations;

/// <summary>
/// Composer that registers the migration component.
/// </summary>
public class WhoDidItMigrationComposer : ComponentComposer<WhoDidItMigrationComponent>
{
}

/// <summary>
/// Component that runs the migration plan on startup.
/// </summary>
public class WhoDidItMigrationComponent : IAsyncComponent
{
    private readonly ICoreScopeProvider _coreScopeProvider;
    private readonly IMigrationPlanExecutor _migrationPlanExecutor;
    private readonly IKeyValueService _keyValueService;
    private readonly IRuntimeState _runtimeState;

    public WhoDidItMigrationComponent(
        ICoreScopeProvider coreScopeProvider,
        IMigrationPlanExecutor migrationPlanExecutor,
        IKeyValueService keyValueService,
        IRuntimeState runtimeState)
    {
        _coreScopeProvider = coreScopeProvider;
        _migrationPlanExecutor = migrationPlanExecutor;
        _keyValueService = keyValueService;
        _runtimeState = runtimeState;
    }

    public async Task InitializeAsync(bool isRestarting, CancellationToken cancellationToken)
    {
        if (_runtimeState.Level < RuntimeLevel.Run)
        {
            return;
        }

        var migrationPlan = new MigrationPlan("WhoDidIt");

        migrationPlan.From(string.Empty)
            .To<AddWhoDidItTable>("whodidit-db");

        var upgrader = new Upgrader(migrationPlan);
         await upgrader.ExecuteAsync(_migrationPlanExecutor, _coreScopeProvider, _keyValueService);
    }

    public void Terminate()
    {
        // Nothing needed here
    }

    public Task TerminateAsync(bool isRestarting, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}

/// <summary>
/// Migration step that creates the WhoDidIt table.
/// </summary>
public class AddWhoDidItTable : AsyncMigrationBase
{
    public AddWhoDidItTable(IMigrationContext context) : base(context)
    {
    }

    protected override Task MigrateAsync()
    {
        Logger.LogDebug("Running migration {MigrationStep}", "AddWhoDidItTable");

        if (TableExists(WhoDidItSchema.TableName) == false)
        {
            Create.Table<WhoDidItSchema>().Do();
            Logger.LogInformation("✅ Created table {TableName}", WhoDidItSchema.TableName);
        }
        else
        {
            Logger.LogDebug("ℹ️ Table {TableName} already exists, skipping creation.", WhoDidItSchema.TableName);
        }

        return Task.CompletedTask;
    }

    /// <summary>
    /// Defines the schema for the WhoDidIt table.
    /// </summary>
    [TableName(TableName)]
    [PrimaryKey("Id", AutoIncrement = true)]
    [ExplicitColumns]
    public class WhoDidItSchema
    {
        public const string TableName = "kjeldsendev_whodidit";

        [PrimaryKeyColumn(AutoIncrement = true, IdentitySeed = 1)]
        [Column("Id")]
        public int Id { get; set; }

        [Column("Username")]
        [Length(255)]
        public required string Username { get; set; }

        [Column("Created")]
        public DateTime Created { get; set; }
    }
}