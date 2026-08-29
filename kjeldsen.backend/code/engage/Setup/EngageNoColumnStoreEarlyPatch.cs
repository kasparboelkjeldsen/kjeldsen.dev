using System.Text.RegularExpressions;
using HarmonyLib;
using Microsoft.Data.SqlClient; // raw SQL
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace kjeldsen.backend.code.engage.Setup;

public static class EngageNoColumnStoreBootstrap
{
    private static bool _wired;
    private static bool _patched;
    private static bool _noColumnStoreEnabled;     // from appsettings
    private static bool _columnstoreSupported;     // probed from DB
    private static bool _probed;                   // ensure one-time probe

    public static IHostApplicationBuilder UseEngageNoColumnStorePatch(this IHostApplicationBuilder builder)
    {
        if (_wired) return builder;
        _wired = true;

        // 0) Toggle via config
        _noColumnStoreEnabled = builder.Configuration.GetValue<bool>("EngageExtensions:NoColumnStore");
        if (!_noColumnStoreEnabled)
            return builder; // disabled => do nothing

        // 1) Probe DB capability (safe + one-time)
        ProbeColumnstoreSupport(builder.Configuration);

        // 2) Try now (assembly may already be loaded)
        TryPatch();

        // 3) If not yet, hook AssemblyLoad and patch when Engage.Common appears
        if (!_patched)
            AppDomain.CurrentDomain.AssemblyLoad += OnAssemblyLoad;

        return builder;
    }

    private static void ProbeColumnstoreSupport(IConfiguration config)
    {
        if (_probed) return;
        _probed = true;

        // Umbraco connection key: ConnectionStrings:umbracoDbDSN
        var cs = config.GetConnectionString("umbracoDbDSN");
        if (string.IsNullOrWhiteSpace(cs))
        {
            _columnstoreSupported = false;
            return;
        }

        try
        {
            using var conn = new SqlConnection(cs);
            conn.Open();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT SERVERPROPERTY('IsColumnstoreIndexSupported')";
            var scalar = cmd.ExecuteScalar();
            // supported only when exactly 1
            _columnstoreSupported = scalar is int i && i == 1
                || scalar is long l && l == 1
                || scalar is byte b && b == 1
                || scalar is decimal d && d == 1
                || scalar is short s && s == 1;
        }
        catch
        {
            // If anything goes wrong, treat as NOT supported (be conservative)
            _columnstoreSupported = false;
        }
    }

    private static void OnAssemblyLoad(object? sender, AssemblyLoadEventArgs e)
    {
        var name = e.LoadedAssembly.GetName().Name;
        if (!string.Equals(name, "Umbraco.Engage.Common", StringComparison.OrdinalIgnoreCase))
            return;

        TryPatch();
        if (_patched)
            AppDomain.CurrentDomain.AssemblyLoad -= OnAssemblyLoad;
    }

    private static void TryPatch()
    {
        if (_patched) return;

        var engageAsm = AppDomain.CurrentDomain.GetAssemblies()
            .FirstOrDefault(a => string.Equals(a.GetName().Name, "Umbraco.Engage.Common", StringComparison.OrdinalIgnoreCase));
        if (engageAsm == null) return;

        var type = engageAsm.GetType("Umbraco.Engage.Common.Utils.ResourceHelper", throwOnError: false);
        var method = type?.GetMethod("LoadEmbeddedResource",
            System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static,
            binder: null, types: new[] { typeof(string) }, modifiers: null);

        if (method == null) return;

        var harmony = new Harmony("engage.extensions.nocolumnstore.lazy");
        var postfix = new HarmonyMethod(typeof(ResourceHelperPostfix).GetMethod(nameof(ResourceHelperPostfix.Postfix),
            System.Reflection.BindingFlags.Static | System.Reflection.BindingFlags.NonPublic));
        harmony.Patch(method, postfix: postfix);

        _patched = true;
    }

    private static class ResourceHelperPostfix
    {
        // Narrow scope to the initial create script; relax if you want upgrades too.
        private const string MustContain = "CreateInitialTables";
        private const string SqlSuffix = ".sql";

        // We still keep your earlier IF-upgrade regex in case you ever want both behaviors.
        private static readonly Regex ReIfNotExists = new(
            @"^\s*IF\s+NOT\s+EXISTS\b",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        internal static void Postfix(string resourceName, ref string __result)
        {
            if (string.IsNullOrEmpty(resourceName) || string.IsNullOrEmpty(__result))
                return;

            if (!resourceName.EndsWith(SqlSuffix, StringComparison.OrdinalIgnoreCase))
                return;

            if (!resourceName.Contains(MustContain, StringComparison.OrdinalIgnoreCase))
                return;

            // If the database supports columnstore, do nothing - let Engage create its NCCIs.
            if (_columnstoreSupported)
                return;

            var newline = __result.Contains("\r\n", StringComparison.Ordinal) ? "\r\n" : "\n";
            var lines = __result.Replace("\r\n", "\n").Split('\n').ToList();

            static bool IsCreateColumnstoreIndex(string line)
            {
                var s = line.AsSpan().Trim();
                return s.IndexOf("CREATE", StringComparison.OrdinalIgnoreCase) >= 0
                    && s.IndexOf("COLUMNSTORE", StringComparison.OrdinalIgnoreCase) >= 0
                    && s.IndexOf("INDEX", StringComparison.OrdinalIgnoreCase) >= 0;
            }

            // Remove only the CREATE ... COLUMNSTORE INDEX statement itself, found by tracking
            // parentheses forward from the CREATE line. Deliberately shape-independent: Engage
            // 17 wrote these blank-line separated and ending ")WITH (...) ON [PRIMARY]" with no
            // semicolon anywhere in the file, while Engage 18 ends them with ");" and nests them
            // inside the table's IF ... BEGIN ... END block.
            //
            // Do NOT scan backwards for a preceding comment header to use as the start of the
            // range. That was the previous approach, and against Engage 18 - where there is no
            // ")WITH" line to stop the forward scan - it swallowed the whole preceding CREATE
            // TABLE, silently dropping five core analytics tables from the schema.
            var ranges = new List<(int Start, int End)>();

            for (var i = 0; i < lines.Count; i++)
            {
                if (!IsCreateColumnstoreIndex(lines[i]))
                    continue;

                var depth = 0;
                var opened = false;
                var end = i;

                for (var k = i; k < lines.Count; k++)
                {
                    foreach (var c in lines[k])
                    {
                        if (c == '(') { depth++; opened = true; }
                        else if (c == ')') depth--;
                    }

                    end = k;

                    // The statement closes when the column list (and any trailing WITH (...))
                    // is balanced again; a terminating semicolon may or may not be present.
                    if (opened && depth <= 0)
                        break;
                }

                ranges.Add((i, end));
            }

            if (ranges.Count == 0)
                return;

            for (var idx = ranges.Count - 1; idx >= 0; idx--)
            {
                var (rangeStart, rangeEnd) = ranges[idx];
                var count = rangeEnd - rangeStart + 1;

                if (rangeStart >= 0 && count > 0 && rangeStart + count <= lines.Count)
                    lines.RemoveRange(rangeStart, count);
            }

            __result = string.Join(newline, lines);
        }
    }
}
