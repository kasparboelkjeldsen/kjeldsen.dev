using System.Data;
using System.Data.Common;
using Microsoft.Data.Sqlite;
using NPoco;
using Umbraco.Engage.Data.Common;
using Umbraco.Engage.Data.Common.NPoco;

namespace kjeldsen.backend.code.engage.Setup.Sqlite;

/// <summary>
/// Engage's own DatabaseFactory news up a Microsoft.Data.SqlClient.SqlConnection directly, so on
/// SQLite every Engage component dies on "Keyword not supported: 'cache'" before the site can
/// finish booting. Everything Engage does with the database goes through IDatabaseFactory, so
/// replacing that single registration is enough to point all of it at SQLite instead.
/// </summary>
public class SqliteEngageDatabaseFactory : IDatabaseFactory
{
    private readonly IConnectionStringProvider _connectionStringProvider;

    public SqliteEngageDatabaseFactory(IConnectionStringProvider connectionStringProvider)
        => _connectionStringProvider = connectionStringProvider;

    /// <summary>
    /// Engage 18's IDatabaseFactory shape: the factory resolves the connection string itself.
    /// </summary>
    public IDatabase CreateDatabase(IsolationLevel? isolationLevel = null)
        => Create(_connectionStringProvider, isolationLevel);

    /// <summary>
    /// Engage 17.1.1's shape, where the provider is passed in per call. Both are declared so this
    /// one file satisfies either version's interface while the two projects upgrade separately;
    /// whichever signature the referenced Engage does not declare is simply an unused method.
    /// </summary>
    public IDatabase CreateDatabase(IConnectionStringProvider connectionStringProvider, IsolationLevel isolationLevel)
        => Create(connectionStringProvider, isolationLevel);

    private static IDatabase Create(IConnectionStringProvider connectionStringProvider, IsolationLevel? isolationLevel)
    {
        // The provider hands us the Umbraco-parsed connection string, so |DataDirectory| is
        // already resolved to a real path.
        //
        // Umbraco's default connection string uses Cache=Shared. Engage keeps a transaction open
        // for the lifetime of each DatabaseContext, and a long-lived write transaction on a
        // shared cache makes other connections fail with SQLITE_LOCKED ("database schema is
        // locked"), which - unlike SQLITE_BUSY - is never retried by the busy timeout. A private
        // cache keeps Engage's connections out of Umbraco's way; busy_timeout then makes the
        // remaining single-writer contention wait rather than throw.
        var connectionString = new SqliteConnectionStringBuilder(connectionStringProvider.ConnectionString)
        {
            Cache = SqliteCacheMode.Private,
            Pooling = true,
        }.ToString();

        var connection = new EngageSqliteConnection(connectionString);
        connection.Open();

        using (var pragma = connection.CreateCommand())
        {
            pragma.CommandText = "PRAGMA busy_timeout = 30000;";
            pragma.ExecuteNonQuery();
        }

        return new SqliteTranslatingDatabase(connection, isolationLevel);
    }
}

/// <summary>
/// NPoco database over the translating connection. Translation itself happens in
/// <see cref="EngageSqliteCommand"/> rather than here, because not every Engage code path goes
/// through NPoco's execution pipeline. This type only adds diagnostics.
/// </summary>
public class SqliteTranslatingDatabase : Database
{
    public SqliteTranslatingDatabase(DbConnection connection, IsolationLevel? isolationLevel)
        // Fully qualified: inside a Database subclass, "DatabaseType" binds to the inherited
        // instance property rather than to NPoco's type.
        : base(connection, NPoco.DatabaseType.SQLite, isolationLevel)
    {
    }

    // Failing statements are reported by EngageSqliteCommand, which sees both the original and
    // the translated text; NPoco's own LastCommand only ever holds the pre-translation version.
}
