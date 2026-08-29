using kjeldsen.backend.code.engage.Setup.Sqlite;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Engage.Common.Composing;
using Umbraco.Engage.Data.Common.NPoco;
using Umbraco.Engage.Web.Common;
using Umbraco.Extensions;

namespace kjeldsen.backend.code.engage.Setup;

/// <summary>
/// Makes Umbraco Engage tolerate a SQLite database, which it refuses to run on out of the box.
///
/// Two things are needed. StartupCheckerComponent throws outright when it sees a SQLite
/// connection string, and because it runs inside Umbraco's component initialisation chain it
/// takes everything after it down too - uSync's first-boot import included - so the site never
/// finishes booting. Separately, Engage's DatabaseFactory constructs a SqlConnection directly,
/// so it has to be swapped for one that speaks SQLite.
///
/// Local runs use SQLite so the CMS underneath can be upgraded in isolation. Production is
/// untouched: on Microsoft.Data.SqlClient this composer does nothing at all.
/// </summary>
[ComposeAfter(typeof(UmbracoEngageApplicationComposer))]
public class EngageSqliteGuardComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        var provider = builder.Config["ConnectionStrings:umbracoDbDSN_ProviderName"];

        if (!string.Equals(provider, "Microsoft.Data.Sqlite", StringComparison.OrdinalIgnoreCase))
            return;

        builder.Components().Remove<StartupCheckerComponent>();
        builder.Services.AddUnique<IDatabaseFactory, SqliteEngageDatabaseFactory>();
    }
}
