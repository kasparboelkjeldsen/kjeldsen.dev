using Umbraco.Bench.Umbraco.Services;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;

namespace Umbraco.Bench.Umbraco.Notifications;

// Any data type saved at the root of the data type tree is moved into its folder
// (/Umbraco/<editorAlias> for built-ins, /Custom/<editorAlias> for ours).
public class DataTypeSavedHandler(DataTypeOrganizationService organizationService)
    : INotificationAsyncHandler<DataTypeSavedNotification>
{
    public async Task HandleAsync(DataTypeSavedNotification notification, CancellationToken cancellationToken)
    {
        foreach (var dataType in notification.SavedEntities)
            await organizationService.OrganizeAsync(dataType);
    }
}
