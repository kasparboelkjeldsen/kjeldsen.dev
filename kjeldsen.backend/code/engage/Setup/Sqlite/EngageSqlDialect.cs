using System.Text.RegularExpressions;

namespace kjeldsen.backend.code.engage.Setup.Sqlite;

/// <summary>
/// Rewrites Umbraco Engage's T-SQL into something SQLite will accept.
///
/// Engage is SQL Server-only by design: its schema scripts and queries use IDENTITY, NVARCHAR,
/// CLUSTERED/NONCLUSTERED, INCLUDE, COLUMNSTORE, IF OBJECT_ID guards, N'' literals and
/// INFORMATION_SCHEMA. Local runs of this site use SQLite so the CMS underneath can be upgraded
/// in isolation, so everything Engage sends to the database passes through here first.
///
/// Two modes: schema scripts get the full treatment, ordinary runtime queries get only the
/// rewrites they need, so we do not reshape statements (or split on ';') unnecessarily.
///
/// This is a local development aid, not a general T-SQL translator. Engage's runtime queries
/// remain SQL Server-flavoured, so expect Engage features themselves to misbehave locally.
/// </summary>
public static class EngageSqlDialect
{
    private const RegexOptions Opts = RegexOptions.IgnoreCase | RegexOptions.Compiled;

    // A SQLite expression producing a v4-shaped GUID string, standing in for NEWID().
    private const string NewIdExpression =
        "(lower(hex(randomblob(4))||'-'||hex(randomblob(2))||'-4'||substr(hex(randomblob(2)),2)" +
        "||'-'||substr('89ab',abs(random())%4+1,1)||substr(hex(randomblob(2)),2)||'-'||hex(randomblob(6))))";

    private static readonly (Regex Pattern, string Replacement)[] TypeMap =
    [
        (new Regex(@"\[?\bnvarchar\b\]?\s*\(\s*(max|\d+)\s*\)", Opts), "TEXT"),
        (new Regex(@"\[?\bvarchar\b\]?\s*\(\s*(max|\d+)\s*\)", Opts), "TEXT"),
        (new Regex(@"\[?\bnchar\b\]?\s*\(\s*\d+\s*\)", Opts), "TEXT"),
        (new Regex(@"\[?\bchar\b\]?\s*\(\s*\d+\s*\)", Opts), "TEXT"),
        (new Regex(@"\[?\bvarbinary\b\]?\s*\(\s*(max|\d+)\s*\)", Opts), "BLOB"),
        (new Regex(@"\[?\bdecimal\b\]?\s*\(\s*\d+\s*,\s*\d+\s*\)", Opts), "REAL"),
        (new Regex(@"\[?\bnumeric\b\]?\s*\(\s*\d+\s*,\s*\d+\s*\)", Opts), "REAL"),
        (new Regex(@"\[?\bdatetime2\b\]?\s*(\(\s*\d+\s*\))?", Opts), "TEXT"),
        (new Regex(@"\[?\bdatetimeoffset\b\]?\s*(\(\s*\d+\s*\))?", Opts), "TEXT"),
        (new Regex(@"\[?\bdatetime\b\]?", Opts), "TEXT"),
        (new Regex(@"\[?\bdate\b\]?(?!\w)", Opts), "TEXT"),
        (new Regex(@"\[?\buniqueidentifier\b\]?", Opts), "TEXT"),
        (new Regex(@"\[?\bntext\b\]?", Opts), "TEXT"),
        (new Regex(@"\[?\btext\b\]?(?!\w)", Opts), "TEXT"),
        (new Regex(@"\[?\bbit\b\]?", Opts), "INTEGER"),
        (new Regex(@"\[?\btinyint\b\]?", Opts), "INTEGER"),
        (new Regex(@"\[?\bsmallint\b\]?", Opts), "INTEGER"),
        (new Regex(@"\[?\bbigint\b\]?", Opts), "INTEGER"),
        (new Regex(@"\[?\bint\b\]?(?!\w)", Opts), "INTEGER"),
        (new Regex(@"\[?\bfloat\b\]?", Opts), "REAL"),
        (new Regex(@"\[?\breal\b\]?", Opts), "REAL"),
        (new Regex(@"\[?\bmoney\b\]?", Opts), "REAL"),
    ];

    // Anything that looks like one of Engage's migration batches rather than a runtime query.
    // Not just DDL: InsertInitialDatasets is pure INSERT plus SET IDENTITY_INSERT, and still
    // needs the full treatment. NPoco's own runtime queries never contain these markers.
    private static readonly Regex IsSchemaScript =
        new(@"\b(CREATE\s+TABLE|ALTER\s+TABLE|CREATE\s+(UNIQUE\s+)?\w*\s*INDEX|DROP\s+TABLE|SET\s+(ANSI_NULLS|ANSI_PADDING|QUOTED_IDENTIFIER|IDENTITY_INSERT)|IF\s+OBJECT_ID|IF\s+(NOT\s+)?EXISTS|\bEXEC\b|\bsys\.|\bDECLARE\s+@)", Opts);

    private static readonly Regex StatementStart =
        new(@"^\s*(CREATE\s+(TABLE|UNIQUE\s+\w*\s*INDEX|\w*\s*INDEX)|ALTER\s+TABLE|INSERT\b|DROP\s+TABLE|UPDATE\b)",
            Opts | RegexOptions.Multiline);

    private static readonly Regex TsqlSetOption =
        new(@"^[ \t]*SET[ \t]+(ANSI_NULLS|ANSI_PADDING|ANSI_WARNINGS|QUOTED_IDENTIFIER|NOCOUNT|IDENTITY_INSERT|ARITHABORT|XACT_ABORT|CONCAT_NULL_YIELDS_NULL|NUMERIC_ROUNDABORT)\b.*$",
            Opts | RegexOptions.Multiline);

    // SQLite's ALTER TABLE cannot add constraints or defaults after the fact. The shipped
    // CreateInitialTables script adds every foreign key and column default that way, so those
    // statements are dropped: the local database loses FK enforcement and column defaults.
    private static readonly Regex UnsupportedAlter =
        new(@"\bALTER\s+TABLE\b(?:(?!\bADD\s+COLUMN\b).)*?\b(WITH\s+(NO)?CHECK\b|ADD\s+CONSTRAINT\b|ADD\s+DEFAULT\b|(NO)?CHECK\s+CONSTRAINT\b|ADD\s+FOREIGN\s+KEY\b|ADD\s+PRIMARY\s+KEY\b|ADD\s+UNIQUE\b|ALTER\s+COLUMN\b|DROP\s+CONSTRAINT\b)",
            Opts | RegexOptions.Singleline);

    // SQLite is dynamically typed, so widening or retyping a column is a no-op; and it cannot
    // rename indexes or constraints, whose names are not semantically meaningful here. Renaming
    // a table or a column is supported and does matter, so those two are translated rather than
    // dropped - CreateInitialTables ships umbracoEngageAnalyticsGoal and a later migration
    // renames it to umbracoEngageSettingsGoal, which Engage then queries by its new name.
    private static readonly Regex SpRenameColumn =
        new(@"EXEC(UTE)?\s+sp_rename\s+'(?<table>[^'.]+)\.(?<old>[^']+)'\s*,\s*'(?<new>[^']+)'\s*,\s*'COLUMN'", Opts);

    // Strictly the two-argument form. The three-argument 'OBJECT' / 'INDEX' forms rename
    // constraints and indexes, which SQLite cannot do and does not need, so they fall through
    // to ExecStatement and are dropped.
    //
    // Engage also uses the two-argument form to rename default and foreign key constraints, and
    // by the time we get here the surrounding sys.* guard that would have told us which is which
    // has already been stripped. Engage names constraints and indexes by prefix, so exclude
    // those and treat everything else as a table.
    private static readonly Regex SpRenameTable =
        new(@"EXEC(UTE)?\s+sp_rename\s+'(?!(DF|FK|PK|UQ|IX|CK|CHK)_)(?<old>[^'.]+)'\s*,\s*'(?<new>[^']+)'\s*(?!,)", Opts);

    // SQLite has no OBJECT_ID/COL_LENGTH; sqlite_master and pragma_table_info answer the same
    // "does this exist?" question, and both return NULL when absent, so IS NULL tests still work.
    private static readonly Regex ObjectIdFunction =
        new(@"\bOBJECT_ID\s*\(\s*(?<arg>@?\w+|'[^']*')\s*(?:,\s*'[^']*'\s*)?\)", Opts);

    private static readonly Regex ColLengthFunction =
        new(@"\bCOL_LENGTH\s*\(\s*(?<table>@?\w+|'[^']*')\s*,\s*(?<column>@?\w+|'[^']*')\s*\)", Opts);

    // Engage queries the SQL Server catalog views directly. Standing in derived tables that
    // expose the same column names keeps the surrounding predicates working untouched -
    // including "type in ('U')", hence the synthetic type column.
    private static readonly Regex SysIndexes = new(@"\[?sys\]?\s*\.\s*\[?indexes\]?", Opts);
    private static readonly Regex SysTables = new(@"\[?sys\]?\s*\.\s*\[?(objects|tables)\]?", Opts);
    private static readonly Regex SysColumns = new(@"\[?sys\]?\s*\.\s*\[?columns\]?", Opts);

    // SQLite keeps no catalog of constraints, so "does this constraint exist" is always no.
    private static readonly Regex SysConstraints =
        new(@"\[?sys\]?\s*\.\s*\[?(default_constraints|foreign_keys|key_constraints|check_constraints)\]?", Opts);

    // The catalog's object_id columns become table names. The negative lookahead keeps this off
    // the OBJECT_ID(...) function, which differs only by an opening parenthesis.
    // The lookbehind keeps this off longer identifiers that merely end in object_id (such as
    // default_object_id); the lookahead keeps it off the OBJECT_ID(...) function.
    private static readonly Regex ObjectIdColumn =
        new(@"(?<!\w)\[?(parent_object_id|object_id)\]?(?!\s*\()", Opts);

    // Anything still starting with EXEC is a stored procedure call SQLite cannot make.
    private static readonly Regex ExecStatement = new(@"\bEXEC(UTE)?\s+\w+", Opts);

    // SQLite has no procedural IF, and a bare BEGIN is parsed as BEGIN TRANSACTION ("cannot
    // start a transaction within a transaction"), so every IF/BEGIN/END/ELSE block marker has to
    // go. Engage's guard conditions are arbitrary T-SQL (OBJECT_ID, COL_LENGTH, sys.* lookups),
    // so match generically from IF up to its BEGIN rather than enumerating condition shapes.
    // Bounded so a stray IF without a BEGIN cannot swallow the rest of the script.
    private static readonly Regex ProceduralIfBlock =
        new(@"\bIF\b(?:(?!\bBEGIN\b).){0,800}?\bBEGIN\b", Opts | RegexOptions.Singleline);

    private static readonly Regex ProceduralIfLine = new(@"^[ \t]*IF\b.*$", Opts | RegexOptions.Multiline);

    private static readonly Regex StandaloneBlockMarker =
        new(@"^\s*(BEGIN|END|ELSE)\s*;?\s*$", Opts | RegexOptions.Multiline);

    // Engage's SqlOrNoop() emits "_:" - a T-SQL GOTO label - as its do-nothing branch.
    private static readonly Regex TsqlLabel = new(@"^\s*\w+:\s*$", Opts | RegexOptions.Multiline);

    private static readonly Regex Whitespace = new(@"\s+", Opts);

    // Shapes the ADO layer re-checks against the live catalog, standing in for the T-SQL guards
    // that had to be stripped. See EngageSqliteCommand.ApplySchemaGuards.
    internal static readonly Regex RenameTableStatement =
        new(@"\bALTER\s+TABLE\s+\[?(?<from>\w+)\]?\s+RENAME\s+TO\s+\[?(?<to>\w+)\]?", Opts);

    internal static readonly Regex RenameColumnStatement =
        new(@"\bALTER\s+TABLE\s+\[?(?<table>\w+)\]?\s+RENAME\s+COLUMN\s+\[?(?<from>\w+)\]?\s+TO\s+\[?(?<to>\w+)\]?", Opts);

    internal static readonly Regex AddColumnStatement =
        new(@"\bALTER\s+TABLE\s+\[?(?<table>\w+)\]?\s+ADD\s+(COLUMN\s+)?\[?(?<column>\w+)\]?", Opts);

    internal static readonly Regex UpdateColumnStatement =
        new(@"\bUPDATE\s+\[?(?<table>\w+)\]?\s+SET\s+\[?(?<column>\w+)\]?\s*=", Opts);

    internal static readonly Regex CreateIndexOnStatement =
        new(@"\bCREATE\s+(UNIQUE\s+)?INDEX\s+(IF\s+NOT\s+EXISTS\s+)?\[?\w+\]?\s+ON\s+\[?(?<table>\w+)\]?", Opts);

    // SQL Server local temp tables (#Name). Distinct from a parameter, which starts with @.
    private static readonly Regex TempTable = new(@"(?<![\w#])#\w+", Opts);

    // T-SQL date parts. SQLite only has strftime, which returns text, hence the cast.
    private static readonly (Regex Pattern, string Format)[] DateParts =
    [
        (new Regex(@"\bYEAR\s*\(\s*(?<arg>[^()]+?)\s*\)", Opts), "%Y"),
        (new Regex(@"\bMONTH\s*\(\s*(?<arg>[^()]+?)\s*\)", Opts), "%m"),
        (new Regex(@"\bDAY\s*\(\s*(?<arg>[^()]+?)\s*\)", Opts), "%d"),
    ];

    private static readonly Regex SelectLine = new(@"^\s*SELECT\b", Opts);

    // SQLite has no ^ (bitwise XOR) operator, but a ^ b is (a | b) - (a & b), and it does have
    // both of those. Engage uses it to flip the 0/1 flags in umbracoEngageLock.
    private static readonly Regex BitwiseXor =
        new(@"(?<left>\[?\w+\]?)\s*\^\s*(?<right>@?\w+|\d+)", Opts);

    // T-SQL scopes an index to its table ("DROP INDEX x ON t"); SQLite index names are global.
    private static readonly Regex DropIndexOnTable =
        new(@"\bDROP\s+INDEX\s+(?<index>\[?\w+\]?)\s+ON\s+\[?\w+\]?", Opts);

    private static readonly Regex DropIndexPlain =
        new(@"\bDROP\s+INDEX\s+(?!IF\s+EXISTS)(?<index>\[?\w+\]?)", Opts);

    // SQL Server's "x AT TIME ZONE 'src' AT TIME ZONE 'UTC'" converts a local timestamp to UTC.
    // SQLite has no timezone database, but its 'utc' modifier converts from the machine's local
    // zone - which is the very zone Engage passes in - so the pair maps onto datetime(x,'utc').
    // A lone AT TIME ZONE only attaches an offset, so it becomes the identity.
    private static readonly Regex AtTimeZoneToUtc = new(
        @"(?<expr>\[?\w+\]?(?:\.\[?\w+\]?)?)\s+AT\s+TIME\s+ZONE\s+(?:@?\w+|'[^']*')\s+AT\s+TIME\s+ZONE\s+(?:@?\w+|'[^']*')",
        Opts);

    private static readonly Regex AtTimeZone = new(
        @"(?<expr>\[?\w+\]?(?:\.\[?\w+\]?)?)\s+AT\s+TIME\s+ZONE\s+(?:@?\w+|'[^']*')", Opts);

    // T-SQL's "DELETE alias FROM table alias JOIN other o ON ... WHERE ...". SQLite has no
    // delete-with-join and cannot alias a DELETE target, so this becomes a WHERE EXISTS and the
    // target alias is dropped, leaving its columns to resolve against the delete target.
    private static readonly Regex DeleteWithJoin = new(
        @"\bDELETE\s+(?:TOP\s*\(?\s*\d+\s*\)?\s+)?(?<alias>\w+)\s+FROM\s+\[?(?<table>\w+)\]?\s+(?:AS\s+)?\k<alias>\b\s+"
        + @"(?<join>INNER|LEFT|RIGHT)?\s*(?:OUTER\s+)?JOIN\s+\[?(?<joined>\w+)\]?\s+(?:AS\s+)?(?<joinedAlias>\w+)\b\s+"
        + @"ON\s+(?<on>[\s\S]+?)\s+WHERE\s+(?<where>[\s\S]+?)(?=;|$)",
        Opts);

    // "LEFT JOIN x ON ... WHERE x.col IS NULL" is an anti-join: it selects rows with NO match.
    // Turning that into EXISTS would delete nothing at all, so it has to become NOT EXISTS.
    private static readonly Regex AntiJoinTest = new(@"^\s*(?<alias>\w+)\.\[?\w+\]?\s+IS\s+NULL\s*$", Opts);

    // T-SQL local variables. SQLite has none, but Engage only ever uses them to hold a single
    // looked-up value, which inlines cleanly as a scalar subquery.
    private static readonly Regex DeclareVariable = new(@"\bDECLARE\s+@(?<name>\w+)\b[^;]*;", Opts);
    private static readonly Regex SelectIntoVariable =
        new(@"\bSELECT\s+@(?<name>\w+)\s*=\s*(?<body>[\s\S]*?);", Opts);
    private static readonly Regex IsNullFunction = new(@"\bISNULL\s*\(", Opts);

    private static readonly Regex DboPrefix = new(@"\[dbo\]\s*\.\s*", Opts);
    private static readonly Regex GoBatch = new(@"^[ \t]*GO[ \t]*$", Opts | RegexOptions.Multiline);
    private static readonly Regex UnicodeLiteral = new(@"\bN'", Opts);

    // SSMS emits a bare "IF NOT EXISTS (...)" on the line before a CREATE INDEX, with no
    // BEGIN block at all. Applied after the BEGIN form so it only mops up what is left.
    private static readonly Regex ExistsGuardWithoutBlock =
        new(@"IF\s+(NOT\s+)?EXISTS\s*\((?:[^()]|\([^()]*\))*\)", Opts);

    private static readonly Regex CreateTable = new(@"\bCREATE\s+TABLE\s+(?!IF\s+NOT\s+EXISTS)", Opts);
    private static readonly Regex CreateIndex = new(@"\bCREATE\s+(UNIQUE\s+)?INDEX\s+(?!IF\s+NOT\s+EXISTS)", Opts);
    private static readonly Regex InsertInto = new(@"\bINSERT\s+INTO\s+", Opts);
    private static readonly Regex BareInsert = new(@"\bINSERT\s+(?!(OR|INTO)\b)", Opts);
    private static readonly Regex IncludeClause = new(@"\bINCLUDE\s*\([^()]*\)", Opts);
    private static readonly Regex Columnstore = new(@"\bCOLUMNSTORE\b", Opts);
    private static readonly Regex CreateAnyIndex = new(@"\bCREATE\b.*\bINDEX\b", Opts | RegexOptions.Singleline);

    private static readonly Regex Clustered = new(@"\b(NON)?CLUSTERED\b", Opts);
    private static readonly Regex NewId = new(@"\bNEWID\s*\(\s*\)", Opts);
    private static readonly Regex UtcNow = new(@"\b(GETUTCDATE|GETDATE|SYSUTCDATETIME|SYSDATETIME)\s*\(\s*\)", Opts);
    // TEXTIMAGE_ON / FILESTREAM_ON have to be listed explicitly: '_' is a word character, so a
    // plain \bON pattern cannot match them and would strand the [PRIMARY] filegroup name behind.
    private static readonly Regex OnPrimary =
        new(@"(?:TEXTIMAGE_ON|FILESTREAM_ON|\bON)\s+(?:\[PRIMARY\]|PRIMARY)", Opts);
    private static readonly Regex WithOptions = new(@"\bWITH\s*\((?:[^()]|\([^()]*\))*\)", Opts);
    private static readonly Regex DanglingComma = new(@",\s*(?=\))", Opts);

    private static readonly Regex IdentityColumn =
        new(@"\[(\w+)\]\s+INTEGER\s+(NOT\s+NULL\s+)?IDENTITY(\s*\(\s*\d+\s*,\s*\d+\s*\))?(\s+NOT\s+NULL)?", Opts);

    private static readonly Regex AnyIdentity = new(@"\bIDENTITY(\s*\(\s*\d+\s*,\s*\d+\s*\))?\b", Opts);

    // INFORMATION_SCHEMA has no SQLite equivalent, but sqlite_master and the pragma_table_info
    // table-valued function can be shaped into derived tables with the same column names, so the
    // surrounding predicates (TABLE_NAME LIKE ..., COLUMN_NAME = ...) work unchanged.
    private static readonly Regex InformationSchemaTables = new(@"\bINFORMATION_SCHEMA\.TABLES\b", Opts);
    private static readonly Regex InformationSchemaColumns = new(@"\bINFORMATION_SCHEMA\.COLUMNS\b", Opts);
    private static readonly Regex SelectTop = new(@"\bSELECT\s+TOP\s*\(?\s*(\d+)\s*\)?\s+", Opts);

    // SQL Server pagination -> SQLite's LIMIT/OFFSET. The bare OFFSET form needs LIMIT -1,
    // since SQLite only accepts OFFSET as part of a LIMIT clause.
    private static readonly Regex OffsetFetch =
        new(@"\bOFFSET\s+(?<offset>@?\w+|\d+)\s+ROWS?\s+FETCH\s+(NEXT|FIRST)\s+(?<take>@?\w+|\d+)\s+ROWS?\s+ONLY\b", Opts);

    private static readonly Regex OffsetOnly =
        new(@"\bOFFSET\s+(?<offset>@?\w+|\d+)\s+ROWS?\b(?!\s*FETCH)", Opts);

    // SQLite has no TRY_CONVERT/TRY_CAST and is dynamically typed, so the conversion is the
    // identity. These appear only in data-repair migrations that clean up values which cannot
    // be parsed as a GUID; on a fresh database there is nothing to repair.
    private static readonly Regex TryConvert =
        new(@"\bTRY_CONVERT\s*\(\s*\[?\w+\]?\s*(\(\s*\d+\s*\))?\s*,\s*(?<expr>[^(),]+?)\s*\)", Opts);

    private static readonly Regex TryCast =
        new(@"\bTRY_CAST\s*\(\s*(?<expr>[^(),]+?)\s+AS\s+\[?\w+\]?\s*(\(\s*\d+\s*\))?\s*\)", Opts);

    public static string Translate(string? sql)
    {
        if (string.IsNullOrWhiteSpace(sql))
            return sql ?? string.Empty;

        // Batches built around #temp tables also use T-SQL's "UPDATE alias ... FROM ... JOIN"
        // shape, which has no faithful SQLite rewrite. They are all data-repair passes over
        // pre-existing rows, so on a local database built from scratch there is nothing for them
        // to repair and skipping the batch entirely is the honest result.
        //
        // Skipping the WHOLE batch matters: Engage's DatabaseContext reference-counts Complete()
        // calls and aborts the shared transaction on dispose if any user failed to complete, so
        // a single failing statement here would silently roll back every migration that ran
        // before it - the plan still logs "Done" while the database stays empty.
        if (TempTable.IsMatch(sql))
            return "SELECT 1";

        return IsSchemaScript.IsMatch(sql) ? TranslateSchemaScript(sql) : TranslateQuery(sql);
    }

    /// <summary>Minimal rewrites for ordinary runtime queries - no statement splitting.</summary>
    private static string TranslateQuery(string sql)
    {
        sql = TranslateCatalogFunctions(sql);
        sql = UtcNow.Replace(sql, "CURRENT_TIMESTAMP");
        sql = NewId.Replace(sql, NewIdExpression);
        sql = UnicodeLiteral.Replace(sql, "'");
        sql = SelectTop.Replace(sql, "SELECT ");
        sql = IsNullFunction.Replace(sql, "IFNULL(");
        // Engage's read queries are peppered with WITH (NOLOCK) table hints. SQLite has no
        // hints and no reader/writer blocking to work around, so they simply go. Safe here for
        // the same reason as in schema scripts: a CTE is "WITH name AS (", never "WITH (".
        sql = WithOptions.Replace(sql, string.Empty);

        foreach (var (pattern, format) in DateParts)
            sql = pattern.Replace(sql, m => $"CAST(strftime('{format}', {m.Groups["arg"].Value}) AS INTEGER)");

        sql = SeparateResultSets(sql);
        return sql;
    }

    /// <summary>
    /// Engage returns several result sets from one command by stacking SELECTs separated only by
    /// a blank line, which SQL Server accepts. SQLite needs an explicit terminator before it will
    /// step to the next statement with NextResult(). Only a SELECT that starts a line at paren
    /// depth zero, directly after a blank line, is treated as a new statement, so subqueries and
    /// UNIONs are left alone.
    /// </summary>
    private static string SeparateResultSets(string sql)
    {
        var lines = sql.Replace("\r\n", "\n").Split('\n');
        var result = new List<string>(lines.Length);
        var depth = 0;
        var seenStatement = false;

        foreach (var line in lines)
        {
            if (depth == 0
                && seenStatement
                && SelectLine.IsMatch(line)
                && result.Count > 0
                && string.IsNullOrWhiteSpace(result[^1]))
            {
                result.Add(";");
            }

            if (SelectLine.IsMatch(line) && depth == 0)
                seenStatement = true;

            foreach (var c in line)
            {
                if (c == '(') depth++;
                else if (c == ')') depth--;
            }

            result.Add(line);
        }

        return string.Join(Environment.NewLine, result);
    }

    /// <summary>
    /// Engage probes the schema with SQL Server catalog functions (DoesTableExist and friends).
    /// The sqlite_master / pragma_table_info equivalents return NULL when the object is missing,
    /// so the surrounding IS NULL / IS NOT NULL tests keep working unchanged.
    /// </summary>
    private static string RewriteJoinedDelete(string sql)
        => DeleteWithJoin.Replace(sql, m =>
        {
            var targetAlias = new Regex($@"\b{Regex.Escape(m.Groups["alias"].Value)}\s*\.", Opts);
            var on = targetAlias.Replace(m.Groups["on"].Value, string.Empty);
            var where = m.Groups["where"].Value;
            var joinedAlias = m.Groups["joinedAlias"].Value;

            var subquery = $"SELECT 1 FROM [{m.Groups["joined"].Value}] {joinedAlias} WHERE ";

            // Anti-join: delete the rows that have no match, so the WHERE test is the join itself.
            var antiJoin = AntiJoinTest.Match(where);
            if (antiJoin.Success
                && string.Equals(antiJoin.Groups["alias"].Value, joinedAlias, StringComparison.OrdinalIgnoreCase))
            {
                return $"DELETE FROM [{m.Groups["table"].Value}] WHERE NOT EXISTS ({subquery}{on})";
            }

            return $"DELETE FROM [{m.Groups["table"].Value}] WHERE EXISTS ("
                   + $"{subquery}({on}) AND ({targetAlias.Replace(where, string.Empty)}))";
        });

    private static string TranslateCatalogFunctions(string sql)
    {
        sql = RewriteJoinedDelete(sql);
        sql = AtTimeZoneToUtc.Replace(sql, m => $"datetime({m.Groups["expr"].Value}, 'utc')");
        sql = AtTimeZone.Replace(sql, m => m.Groups["expr"].Value);
        sql = BitwiseXor.Replace(sql,
            m => $"(({m.Groups["left"].Value} | {m.Groups["right"].Value}) - ({m.Groups["left"].Value} & {m.Groups["right"].Value}))");
        sql = DropIndexOnTable.Replace(sql, m => $"DROP INDEX {m.Groups["index"].Value}");
        sql = DropIndexPlain.Replace(sql, m => $"DROP INDEX IF EXISTS {m.Groups["index"].Value}");

        sql = InformationSchemaTables.Replace(sql,
            "(SELECT name AS TABLE_NAME FROM sqlite_master WHERE type = 'table')");

        sql = InformationSchemaColumns.Replace(sql,
            "(SELECT m.name AS TABLE_NAME, p.name AS COLUMN_NAME, lower(p.type) AS DATA_TYPE "
            + "FROM sqlite_master m JOIN pragma_table_info(m.name) p WHERE m.type = 'table')");

        // default_object_id is only ever compared against 0 to ask "does this column have a
        // default?", which pragma_table_info answers with dflt_value.
        sql = SysColumns.Replace(sql,
            "(SELECT p.name AS name, m.name AS tbl_name, "
            + "CASE WHEN p.\"notnull\" = 0 THEN 1 ELSE 0 END AS is_nullable, "
            + "CASE WHEN p.dflt_value IS NOT NULL THEN 1 ELSE 0 END AS default_object_id "
            + "FROM sqlite_master m JOIN pragma_table_info(m.name) p WHERE m.type = 'table')");

        sql = SysIndexes.Replace(sql, "(SELECT name, tbl_name, 'I' AS type FROM sqlite_master WHERE type = 'index')");
        sql = SysTables.Replace(sql, "(SELECT name, name AS tbl_name, 'U' AS type FROM sqlite_master WHERE type = 'table')");
        // Always empty: SQLite keeps no constraint catalog, so "does this constraint exist" is
        // always no. The column list has to cover everything Engage selects from these views.
        sql = SysConstraints.Replace(sql,
            "(SELECT NULL AS name, NULL AS tbl_name, NULL AS type, NULL AS definition WHERE 0)");
        sql = ObjectIdColumn.Replace(sql, "tbl_name");

        sql = ObjectIdFunction.Replace(sql,
            m => $"(SELECT name FROM sqlite_master WHERE name = {m.Groups["arg"].Value})");

        // COL_LENGTH is only ever used as a scalar existence probe, and callers convert the
        // result to a number, so yield 1/NULL rather than the column name.
        sql = ColLengthFunction.Replace(sql,
            m => $"(SELECT 1 FROM pragma_table_info({m.Groups["table"].Value}) WHERE name = {m.Groups["column"].Value})");

        sql = OffsetFetch.Replace(sql, m => $"LIMIT {m.Groups["take"].Value} OFFSET {m.Groups["offset"].Value}");
        sql = OffsetOnly.Replace(sql, m => $"LIMIT -1 OFFSET {m.Groups["offset"].Value}");

        sql = TryConvert.Replace(sql, m => m.Groups["expr"].Value);
        sql = TryCast.Replace(sql, m => m.Groups["expr"].Value);

        return sql;
    }

    private static string TranslateSchemaScript(string sql)
    {
        sql = TsqlSetOption.Replace(sql, string.Empty);
        sql = DboPrefix.Replace(sql, string.Empty);
        sql = GoBatch.Replace(sql, ";");
        sql = UnicodeLiteral.Replace(sql, "'");

        sql = InlineTsqlVariables(sql);
        sql = AddStatementTerminators(sql);

        // Strip every procedural guard FIRST, while "IF" in the script can only be T-SQL control
        // flow. Engage's If*Exists helpers emit "IF <cond> BEGIN a END ELSE BEGIN b END"; with
        // the guard gone both branches run unconditionally, which is what we want on a fresh
        // install, where the "does it already exist" answer is always the same. This has to
        // happen before CreateTable introduces its own "IF NOT EXISTS", or these patterns would
        // start matching the CREATE TABLE statements we just rewrote.
        sql = ProceduralIfBlock.Replace(sql, string.Empty);
        sql = ExistsGuardWithoutBlock.Replace(sql, string.Empty);
        sql = ProceduralIfLine.Replace(sql, string.Empty);
        sql = StandaloneBlockMarker.Replace(sql, string.Empty);
        sql = TsqlLabel.Replace(sql, string.Empty);

        sql = CreateTable.Replace(sql, "CREATE TABLE IF NOT EXISTS ");

        sql = SpRenameColumn.Replace(sql,
            m => $"ALTER TABLE [{m.Groups["table"].Value}] RENAME COLUMN [{m.Groups["old"].Value}] TO [{m.Groups["new"].Value}]");
        sql = SpRenameTable.Replace(sql,
            m => $"ALTER TABLE [{m.Groups["old"].Value}] RENAME TO [{m.Groups["new"].Value}]");

        sql = IsNullFunction.Replace(sql, "IFNULL(");
        sql = TranslateCatalogFunctions(sql);

        sql = DropColumnstoreIndexStatements(sql);
        sql = IncludeClause.Replace(sql, string.Empty);

        foreach (var (pattern, replacement) in TypeMap)
            sql = pattern.Replace(sql, replacement);

        sql = Clustered.Replace(sql, string.Empty);
        sql = NewId.Replace(sql, NewIdExpression);
        sql = UtcNow.Replace(sql, "CURRENT_TIMESTAMP");
        sql = OnPrimary.Replace(sql, string.Empty);
        // 'WITH (' only ever introduces T-SQL storage options; a CTE is 'WITH name AS ('.
        sql = WithOptions.Replace(sql, string.Empty);
        sql = DanglingComma.Replace(sql, " ");

        sql = CreateIndex.Replace(sql,
            m => "CREATE " + (m.Groups[1].Success ? m.Groups[1].Value : string.Empty) + "INDEX IF NOT EXISTS ");
        sql = InsertInto.Replace(sql, "INSERT OR IGNORE INTO ");
        sql = BareInsert.Replace(sql, "INSERT OR IGNORE INTO ");

        var statements = sql.Split(';')
            .Where(s => !string.IsNullOrWhiteSpace(s)
                        && !UnsupportedAlter.IsMatch(s)
                        && !ExecStatement.IsMatch(s))
            .Select(FixIdentity);

        // Both branches of a stripped IF/ELSE guard usually carry the same statement (Engage
        // asks "does this column exist?" and adds it in the else, then adds it again in the
        // outer else when the table is missing). Running an ADD COLUMN twice is an error in
        // SQLite, so collapse statements that are textually identical once whitespace is
        // normalised, keeping the first occurrence and the original order.
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var deduplicated = statements
            .Where(s => seen.Add(Whitespace.Replace(s, " ").Trim()));

        return string.Join(";\n", deduplicated) + ";";
    }

    /// <summary>
    /// Rewrites "DECLARE @v ...; SELECT @v = expr FROM ...;" into an inline scalar subquery at
    /// each use of @v. Only variables introduced by a DECLARE are substituted, so NPoco's own
    /// @0/@1 parameters are never touched.
    /// </summary>
    private static string InlineTsqlVariables(string sql)
    {
        if (!sql.Contains("DECLARE", StringComparison.OrdinalIgnoreCase))
            return sql;

        var declared = new HashSet<string>(
            DeclareVariable.Matches(sql).Select(m => m.Groups["name"].Value),
            StringComparer.OrdinalIgnoreCase);

        if (declared.Count == 0)
            return sql;

        sql = DeclareVariable.Replace(sql, string.Empty);

        var values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        sql = SelectIntoVariable.Replace(sql, m =>
        {
            var name = m.Groups["name"].Value;
            if (!declared.Contains(name))
                return m.Value;

            values[name] = $"(SELECT {m.Groups["body"].Value.Trim()})";
            return string.Empty;
        });

        // Longest first, so @visitorId is not clipped by a shorter @visitor.
        foreach (var (name, expression) in values.OrderByDescending(v => v.Key.Length))
            sql = Regex.Replace(sql, $@"@{Regex.Escape(name)}\b", expression.Replace("$", "$$"), Opts);

        return sql;
    }

    /// <summary>
    /// Several Engage scripts separate statements with blank lines or comments rather than
    /// semicolons, which SQLite will not parse. Emit an explicit terminator before each
    /// statement start; the resulting empty statements are discarded when we split.
    /// </summary>
    private static string AddStatementTerminators(string sql)
        => StatementStart.Replace(sql, m => ";" + Environment.NewLine + m.Value);

    /// <summary>COLUMNSTORE indexes have no SQLite equivalent, so drop those statements whole.</summary>
    private static string DropColumnstoreIndexStatements(string sql)
        => string.Join(";", sql.Split(';')
            .Where(s => !(Columnstore.IsMatch(s) && CreateAnyIndex.IsMatch(s))));

    /// <summary>
    /// SQLite only auto-increments a column declared INTEGER PRIMARY KEY, so an IDENTITY column
    /// paired with a separate single-column PRIMARY KEY constraint has to be folded into one.
    /// </summary>
    private static string FixIdentity(string statement)
    {
        var identity = IdentityColumn.Match(statement);
        if (!identity.Success)
            return AnyIdentity.Replace(statement, string.Empty);

        var column = identity.Groups[1].Value;
        var primaryKey = new Regex(
            @",?\s*CONSTRAINT\s+\[[^\]]+\]\s+PRIMARY\s+KEY\s*\(\s*\[" + Regex.Escape(column) + @"\]\s*(ASC|DESC)?\s*\)",
            Opts).Match(statement);

        if (!primaryKey.Success)
            return AnyIdentity.Replace(statement, string.Empty);

        statement = statement[..primaryKey.Index] + statement[(primaryKey.Index + primaryKey.Length)..];

        identity = IdentityColumn.Match(statement);
        if (!identity.Success)
            return AnyIdentity.Replace(statement, string.Empty);

        return statement[..identity.Index]
               + $"[{column}] INTEGER PRIMARY KEY AUTOINCREMENT"
               + statement[(identity.Index + identity.Length)..];
    }
}
