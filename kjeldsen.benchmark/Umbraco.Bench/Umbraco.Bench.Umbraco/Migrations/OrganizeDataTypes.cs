using Umbraco.Bench.Umbraco.Services;
using Umbraco.Cms.Infrastructure.Migrations;

namespace Umbraco.Bench.Umbraco.Migrations;

public class OrganizeDataTypes(
    IMigrationContext context,
    DataTypeOrganizationService organizationService) : AsyncMigrationBase(context)
{
    protected override async Task MigrateAsync() =>
        await organizationService.OrganizeAllAsync();
}
