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

            // If DB supports columnstore, do nothing — let Engage create NCCIs.
            if (_columnstoreSupported)
                return;

            // Otherwise: strip each NCCI block completely.
            var newline = __result.Contains("\r\n", StringComparison.Ordinal) ? "\r\n" : "\n";
            var lines = __result.Replace("\r\n", "\n").Split('\n').ToList();

            static bool IsCreateNonclusteredColumnstore(string line)
            {
                var s = line.AsSpan().Trim();
                return s.IndexOf("CREATE", StringComparison.OrdinalIgnoreCase) >= 0
                    && s.IndexOf("NONCLUSTERED", StringComparison.OrdinalIgnoreCase) >= 0
                    && s.IndexOf("COLUMNSTORE", StringComparison.OrdinalIgnoreCase) >= 0
                    && s.IndexOf("INDEX", StringComparison.OrdinalIgnoreCase) >= 0;
            }

            static bool IsBlockCommentHeader(string line)
                => line.TrimStart().StartsWith("/*", StringComparison.Ordinal); // matches /***** Object: Index ... *****/

            static bool IsWithTerminator(string line)
                => line.IndexOf(")WITH", StringComparison.OrdinalIgnoreCase) >= 0;

            // Collect removal ranges [start..end] so we can remove after scanning
            var ranges = new List<(int start, int end)>();

            for (int i = 0; i < lines.Count; i++)
            {
                if (!IsCreateNonclusteredColumnstore(lines[i])) continue;

                // find start: walk back to nearest preceding block comment, else include the IF line if present
                int start = i;
                int j = i - 1;
                int? ifLine = null;

                while (j >= 0 && string.IsNullOrWhiteSpace(lines[j])) j--;
                // capture an immediate preceding IF line (common structure)
                if (j >= 0 && lines[j].TrimStart().StartsWith("IF", StringComparison.OrdinalIgnoreCase))
                    ifLine = j;

                // then keep walking back to the block comment header (preferred start)
                while (j >= 0 && !IsBlockCommentHeader(lines[j])) j--;

                start = j >= 0 ? j : (ifLine ?? i);

                // find end: walk forward to the WITH terminator line
                int k = i;
                while (k < lines.Count && !IsWithTerminator(lines[k])) k++;
                int end = k < lines.Count ? k : i;

                ranges.Add((start, end));
            }

            if (ranges.Count == 0)
                return;

            // Merge overlapping ranges (if any) then remove from bottom to top
            ranges = ranges
                .OrderBy(r => r.start)
                .Aggregate(new List<(int start, int end)>(), (acc, r) =>
                {
                    if (acc.Count == 0) acc.Add(r);
                    else
                    {
                        var last = acc[^1];
                        if (r.start <= last.end + 1) // overlap/adjacent
                            acc[^1] = (last.start, Math.Max(last.end, r.end));
                        else
                            acc.Add(r);
                    }
                    return acc;
                });

            for (int idx = ranges.Count - 1; idx >= 0; idx--)
            {
                var (start, end) = ranges[idx];
                var count = end - start + 1;
                if (start >= 0 && count > 0 && start + count <= lines.Count)
                    lines.RemoveRange(start, count);
            }

            __result = string.Join(newline, lines);
        }
    }
}
