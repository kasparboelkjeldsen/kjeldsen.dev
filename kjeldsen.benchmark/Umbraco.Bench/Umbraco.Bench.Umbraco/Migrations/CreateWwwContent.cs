using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;

namespace Umbraco.Bench.Umbraco.Migrations;

public class CreateWwwContent(
    IMigrationContext context,
    IContentService contentService) : AsyncMigrationBase(context)
{
    protected override Task MigrateAsync()
    {
        var alreadyThere = contentService.GetRootContent()
            .Any(c => c.ContentType.Alias == CreateSiteRootDocumentType.SiteRootAlias);
        if (alreadyThere)
            return Task.CompletedTask;

        var content = contentService.Create("WWW", Constants.System.Root, CreateSiteRootDocumentType.SiteRootAlias);
        contentService.Save(content);
        contentService.Publish(content, ["*"]);
        return Task.CompletedTask;
    }
}
