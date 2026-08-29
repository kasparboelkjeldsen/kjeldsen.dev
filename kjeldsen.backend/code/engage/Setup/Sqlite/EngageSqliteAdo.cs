using System.Collections;
using System.Data;
using System.Data.Common;
using Microsoft.Data.Sqlite;

namespace kjeldsen.backend.code.engage.Setup.Sqlite;

/// <summary>
/// The ADO layer Engage talks to on SQLite. It does two jobs.
///
/// First, translation. Doing it here rather than in NPoco's OnExecutingCommand hook is
/// deliberate: Engage 18's ExecuteWithTimeout builds a command and calls ExecuteNonQuery on it
/// directly, bypassing NPoco's execution pipeline entirely, so a hook at the NPoco level silently
/// misses every schema migration. The command object is the one place every statement must pass
/// through, whoever executes it.
///
/// Second, integer width. SQLite stores every integer as 64-bit, so Microsoft.Data.Sqlite returns
/// Int64 for any INTEGER column, while SQL Server returns Int32 for an [int]. Engage's migrations
/// read untyped rows and assign straight to int? - "int? oldUserId = row[oldIntColumnName]" -
/// which throws "Cannot implicitly convert type 'long' to 'int?'". Narrowing to Int32 when the
/// value fits is safe in both directions, because int widens to long implicitly while the reverse
/// does not. Values beyond Int32 are left alone.
/// </summary>
public class EngageSqliteConnection : SqliteConnection
{
    public EngageSqliteConnection(string connectionString) : base(connectionString)
    {
    }

    protected override DbCommand CreateDbCommand()
    {
        var command = new EngageSqliteCommand { Connection = this };

        if (Transaction is not null)
            command.Transaction = Transaction;

        return command;
    }
}

public class EngageSqliteCommand : SqliteCommand
{
    /// <summary>The statement as Engage wrote it, kept for diagnostics after translation.</summary>
    public string? OriginalCommandText { get; private set; }

    private string? _translated;

    private void Translate()
    {
        // Commands get reused with new text; only translate when the text is not already ours.
        if (_translated is not null && ReferenceEquals(CommandText, _translated))
            return;

        OriginalCommandText = CommandText;
        CommandText = ApplySchemaGuards(EngageSqlDialect.Translate(CommandText));
        _translated = CommandText;
    }

    /// <summary>
    /// Re-implements the "IF EXISTS" semantics SQLite has no syntax for, by asking the live
    /// catalog instead. The dialect has to strip Engage's T-SQL guards wholesale - SQLite has no
    /// procedural IF - which leaves statements running unconditionally. That is usually harmless,
    /// but not always: Engage 18 creates umbracoEngageSettingsGoal directly, so a later migration
    /// renaming umbracoEngageAnalyticsGoal to it has nothing to rename and fails the whole plan.
    /// Statements that cannot apply are dropped, which is what the original guard would have done.
    /// </summary>
    private string ApplySchemaGuards(string sql)
    {
        if (sql.IndexOf("ALTER TABLE", StringComparison.OrdinalIgnoreCase) < 0
            && sql.IndexOf("INDEX", StringComparison.OrdinalIgnoreCase) < 0
            && sql.IndexOf("UPDATE", StringComparison.OrdinalIgnoreCase) < 0)
        {
            return sql;
        }

        var kept = sql.Split(';')
            .Where(s => !string.IsNullOrWhiteSpace(s) && CanApply(s))
            .ToList();

        return kept.Count == 0 ? "SELECT 1" : string.Join(";" + Environment.NewLine, kept) + ";";
    }

    private bool CanApply(string statement)
    {
        var renameTable = EngageSqlDialect.RenameTableStatement.Match(statement);
        if (renameTable.Success)
        {
            return TableExists(renameTable.Groups["from"].Value)
                   && !TableExists(renameTable.Groups["to"].Value);
        }

        var renameColumn = EngageSqlDialect.RenameColumnStatement.Match(statement);
        if (renameColumn.Success)
        {
            return ColumnExists(renameColumn.Groups["table"].Value, renameColumn.Groups["from"].Value)
                   && !ColumnExists(renameColumn.Groups["table"].Value, renameColumn.Groups["to"].Value);
        }

        var addColumn = EngageSqlDialect.AddColumnStatement.Match(statement);
        if (addColumn.Success)
        {
            return TableExists(addColumn.Groups["table"].Value)
                   && !ColumnExists(addColumn.Groups["table"].Value, addColumn.Groups["column"].Value);
        }

        var createIndex = EngageSqlDialect.CreateIndexOnStatement.Match(statement);
        if (createIndex.Success)
            return TableExists(createIndex.Groups["table"].Value);

        // Data-repair migrations sometimes target columns a newer schema no longer has.
        var update = EngageSqlDialect.UpdateColumnStatement.Match(statement);
        if (update.Success)
            return ColumnExists(update.Groups["table"].Value, update.Groups["column"].Value);

        return true;
    }

    private bool TableExists(string name) => ScalarExists(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = $name", ("$name", name));

    private bool ColumnExists(string table, string column) => ScalarExists(
        "SELECT 1 FROM pragma_table_info($table) WHERE name = $column", ("$table", table), ("$column", column));

    private bool ScalarExists(string sql, params (string Name, string Value)[] parameters)
    {
        try
        {
            using var probe = new SqliteCommand(sql, (SqliteConnection)Connection!, Transaction);

            foreach (var (name, value) in parameters)
                probe.Parameters.AddWithValue(name, value);

            return probe.ExecuteScalar() is not null;
        }
        catch
        {
            // If the probe itself fails, let the real statement run and report the real error.
            return true;
        }
    }

    protected override DbDataReader ExecuteDbDataReader(CommandBehavior behavior)
    {
        Translate();
        try
        {
            return new Int32CoercingDataReader(base.ExecuteDbDataReader(behavior));
        }
        catch (Exception x) { Report(x); throw; }
    }

    protected override async Task<DbDataReader> ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
    {
        Translate();
        try
        {
            return new Int32CoercingDataReader(await base.ExecuteDbDataReaderAsync(behavior, cancellationToken));
        }
        catch (Exception x) { Report(x); throw; }
    }

    public override int ExecuteNonQuery()
    {
        Translate();
        try
        {
            return base.ExecuteNonQuery();
        }
        catch (Exception x) { Report(x); throw; }
    }

    public override object? ExecuteScalar()
    {
        Translate();
        try
        {
            return base.ExecuteScalar();
        }
        catch (Exception x) { Report(x); throw; }
    }

    /// <summary>
    /// Dumps the statement as Engage wrote it alongside what we actually sent to SQLite. Engage
    /// builds much of its SQL in C#, so when a translation gap bites this pairing is the only way
    /// to see it. Best-effort, and never allowed to mask the original exception.
    /// </summary>
    private void Report(Exception x)
    {
        try
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "umbraco", "Logs", "engage-sql-failures.log");
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            File.AppendAllText(path,
                $"---- {x.Message}{Environment.NewLine}"
                + $"==== ORIGINAL ===={Environment.NewLine}{OriginalCommandText}{Environment.NewLine}"
                + $"==== TRANSLATED ===={Environment.NewLine}{CommandText}{Environment.NewLine}{Environment.NewLine}");
        }
        catch
        {
            // diagnostics only
        }
    }
}

public sealed class Int32CoercingDataReader : DbDataReader
{
    private readonly DbDataReader _inner;

    public Int32CoercingDataReader(DbDataReader inner) => _inner = inner;

    private static object Coerce(object value)
        => value is long l && l >= int.MinValue && l <= int.MaxValue ? (int)l : value;

    public override object GetValue(int ordinal) => Coerce(_inner.GetValue(ordinal));

    public override int GetValues(object[] values)
    {
        var count = _inner.GetValues(values);

        for (var i = 0; i < count; i++)
            values[i] = Coerce(values[i]);

        return count;
    }

    public override object this[int ordinal] => GetValue(ordinal);
    public override object this[string name] => GetValue(GetOrdinal(name));

    public override int Depth => _inner.Depth;
    public override int FieldCount => _inner.FieldCount;
    public override bool HasRows => _inner.HasRows;
    public override bool IsClosed => _inner.IsClosed;
    public override int RecordsAffected => _inner.RecordsAffected;

    public override bool GetBoolean(int ordinal) => _inner.GetBoolean(ordinal);
    public override byte GetByte(int ordinal) => _inner.GetByte(ordinal);
    public override long GetBytes(int ordinal, long dataOffset, byte[]? buffer, int bufferOffset, int length)
        => _inner.GetBytes(ordinal, dataOffset, buffer, bufferOffset, length);
    public override char GetChar(int ordinal) => _inner.GetChar(ordinal);
    public override long GetChars(int ordinal, long dataOffset, char[]? buffer, int bufferOffset, int length)
        => _inner.GetChars(ordinal, dataOffset, buffer, bufferOffset, length);
    public override string GetDataTypeName(int ordinal) => _inner.GetDataTypeName(ordinal);
    public override DateTime GetDateTime(int ordinal) => _inner.GetDateTime(ordinal);
    public override decimal GetDecimal(int ordinal) => _inner.GetDecimal(ordinal);
    public override double GetDouble(int ordinal) => _inner.GetDouble(ordinal);
    public override Type GetFieldType(int ordinal) => _inner.GetFieldType(ordinal);
    public override float GetFloat(int ordinal) => _inner.GetFloat(ordinal);
    public override Guid GetGuid(int ordinal) => _inner.GetGuid(ordinal);
    public override short GetInt16(int ordinal) => _inner.GetInt16(ordinal);
    public override int GetInt32(int ordinal) => _inner.GetInt32(ordinal);
    public override long GetInt64(int ordinal) => _inner.GetInt64(ordinal);
    public override string GetName(int ordinal) => _inner.GetName(ordinal);
    public override int GetOrdinal(string name) => _inner.GetOrdinal(name);
    public override string GetString(int ordinal) => _inner.GetString(ordinal);
    public override bool IsDBNull(int ordinal) => _inner.IsDBNull(ordinal);
    public override bool NextResult() => _inner.NextResult();
    public override bool Read() => _inner.Read();
    public override IEnumerator GetEnumerator() => ((IEnumerable)_inner).GetEnumerator();
    public override DataTable? GetSchemaTable() => _inner.GetSchemaTable();
    public override void Close() => _inner.Close();

    protected override void Dispose(bool disposing)
    {
        if (disposing)
            _inner.Dispose();

        base.Dispose(disposing);
    }
}
