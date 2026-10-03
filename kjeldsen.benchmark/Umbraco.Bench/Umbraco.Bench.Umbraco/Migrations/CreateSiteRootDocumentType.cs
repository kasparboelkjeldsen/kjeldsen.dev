using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.ContentTypeEditing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Services.ContentTypeEditing;
using Umbraco.Cms.Infrastructure.Migrations;

namespace Umbraco.Bench.Umbraco.Migrations;

// Commandment 9: a root node can only be a Repository. Site Root is that Repository —
// an empty container document type that is the only thing allowed at the content root.
public class CreateSiteRootDocumentType(
    IMigrationContext context,
    IContentTypeService contentTypeService,
    IContentTypeEditingService contentTypeEditingService) : AsyncMigrationBase(context)
{
    public const string SiteRootAlias = "siteRoot";
    public static readonly Guid SiteRootKey = new("0b5f1e5b-0a9a-4c4f-8e8c-1d01b2a3c4e1");

    protected override async Task MigrateAsync()
    {
        if (contentTypeService.Get(SiteRootAlias) is not null)
            return;

        var model = new ContentTypeCreateModel
        {
            Key = SiteRootKey,
            Alias = SiteRootAlias,
            Name = "Site Root",
            Description = "Repository at the content root. Sites live beneath it — the root itself never renders.",
            Icon = "icon-globe",
            AllowedAsRoot = true,
            ContainerKey = CreateDocumentTypeFolders.RepositoriesKey,
        };

        var attempt = await contentTypeEditingService.CreateAsync(model, Constants.Security.SuperUserKey);
        if (!attempt.Success)
            throw new InvalidOperationException($"Failed to create the Site Root document type: {attempt.Status}");
    }
}
