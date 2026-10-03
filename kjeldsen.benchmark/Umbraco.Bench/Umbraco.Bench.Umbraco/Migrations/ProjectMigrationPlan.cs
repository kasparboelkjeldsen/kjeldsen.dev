using Umbraco.Cms.Core.Packaging;

namespace Umbraco.Bench.Umbraco.Migrations;

public class ProjectMigrationPlan : PackageMigrationPlan
{
    public ProjectMigrationPlan() : base("Umbraco.Bench") { }

    protected override void DefinePlan()
    {
        From(string.Empty)
            .To<CreateDocumentTypeFolders>("umbraco.bench-v1-document-type-folders")
            .To<CreateSiteRootDocumentType>("umbraco.bench-v2-site-root-document-type")
            .To<CreateWwwContent>("umbraco.bench-v3-www-content")
            .To<OrganizeDataTypes>("umbraco.bench-v4-organize-data-types");
    }
}
