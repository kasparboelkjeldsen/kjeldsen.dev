using Microsoft.Extensions.DependencyInjection;
using Umbraco.Bench.Umbraco.Migrations;
using Umbraco.Bench.Umbraco.Notifications;
using Umbraco.Bench.Umbraco.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Notifications;

namespace Umbraco.Bench.Umbraco.Composers;

public class ProjectComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // Transient: migrations are resolved from the root provider, where scoped services fail
        builder.Services.AddTransient<DataTypeOrganizationService>();

        builder.AddNotificationAsyncHandler<DataTypeSavedNotification, DataTypeSavedHandler>();
        builder.AddNotificationAsyncHandler<UmbracoApplicationStartedNotification, McpApiUserHandler>();

        builder.PackageMigrationPlans()
            .Add<ProjectMigrationPlan>();
    }
}
