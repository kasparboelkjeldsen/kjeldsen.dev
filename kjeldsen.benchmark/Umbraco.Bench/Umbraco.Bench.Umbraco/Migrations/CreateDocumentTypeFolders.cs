using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;

namespace Umbraco.Bench.Umbraco.Migrations;

// Commandment 2: there are 6 document types — sort them into 6 folders.
public class CreateDocumentTypeFolders(
    IMigrationContext context,
    IContentTypeContainerService containerService) : AsyncMigrationBase(context)
{
    public static readonly Guid PagesKey = new("0b5f1e5b-0a9a-4c4f-8e8c-1d01b2a3c4d1");
    public static readonly Guid BlocksKey = new("0b5f1e5b-0a9a-4c4f-8e8c-1d01b2a3c4d2");
    public static readonly Guid CompositionsKey = new("0b5f1e5b-0a9a-4c4f-8e8c-1d01b2a3c4d3");
    public static readonly Guid DataKey = new("0b5f1e5b-0a9a-4c4f-8e8c-1d01b2a3c4d4");
    public static readonly Guid RepositoriesKey = new("0b5f1e5b-0a9a-4c4f-8e8c-1d01b2a3c4d5");
    public static readonly Guid RepositoryItemsKey = new("0b5f1e5b-0a9a-4c4f-8e8c-1d01b2a3c4d6");

    private static readonly (Guid Key, string Name)[] Folders =
    [
        (PagesKey, "Pages"),
        (BlocksKey, "Blocks"),
        (CompositionsKey, "Compositions"),
        (DataKey, "Data"),
        (RepositoriesKey, "Repositories"),
        (RepositoryItemsKey, "Repository Items"),
    ];

    protected override async Task MigrateAsync()
    {
        foreach (var (key, name) in Folders)
        {
            if (await containerService.GetAsync(key) is not null)
                continue;

            var attempt = await containerService.CreateAsync(key, name, null, Constants.Security.SuperUserKey);
            if (!attempt.Success)
                throw new InvalidOperationException($"Failed to create document type folder 'Umbraco.Bench': {attempt.Status}");
        }
    }
}
