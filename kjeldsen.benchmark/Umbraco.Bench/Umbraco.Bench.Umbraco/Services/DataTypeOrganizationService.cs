using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Umbraco.Bench.Umbraco.Services;

// Commandment 3: a custom data type can never be at the root of the data type folder.
// Built-in data types are grouped under /Umbraco/<editorAlias>, custom ones under /Custom/<editorAlias>.
public class DataTypeOrganizationService(
    IDataTypeService dataTypeService,
    IDataTypeContainerService containerService)
{
    private const string CustomFolderName = "Custom";
    private const string BuiltInFolderName = "Umbraco";

    public async Task<int> OrganizeAllAsync()
    {
        var all = await dataTypeService.GetAllAsync();
        var organized = 0;
        foreach (var dataType in all.Where(dt => dt.ParentId == -1))
        {
            if (await OrganizeAsync(dataType))
                organized++;
        }

        return organized;
    }

    public async Task<bool> OrganizeAsync(IDataType dataType)
    {
        if (dataType.ParentId != -1)
            return false;

        var rootName = dataType.Id < 0 ? BuiltInFolderName : CustomFolderName;
        var folderKey = await EnsureFolderPathAsync([rootName, dataType.EditorAlias]);
        await dataTypeService.MoveAsync(dataType, folderKey, Constants.Security.SuperUserKey);
        return true;
    }

    private async Task<Guid> EnsureFolderPathAsync(string[] segments)
    {
        var containers = (await containerService.GetAllAsync()).ToList();
        var parentId = -1;
        Guid? parentKey = null;

        foreach (var segment in segments)
        {
            var container = containers.FirstOrDefault(c =>
                c.ParentId == parentId &&
                string.Equals(c.Name, segment, StringComparison.OrdinalIgnoreCase));

            if (container is null)
            {
                var attempt = await containerService.CreateAsync(null, segment, parentKey, Constants.Security.SuperUserKey);
                if (!attempt.Success)
                    throw new InvalidOperationException($"Failed to create data type folder '{segment}'.");
                container = attempt.Result!;
            }

            parentId = container.Id;
            parentKey = container.Key;
        }

        return parentKey!.Value;
    }
}
