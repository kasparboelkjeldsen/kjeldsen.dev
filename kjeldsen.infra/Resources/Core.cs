using Pulumi;
using AzureNative = Pulumi.AzureNative;

namespace Kjeldsen.Infra;

/// <summary>
/// Resource group, Log Analytics workspace and the two Application Insights components.
/// </summary>
public static class Core
{
    public static void Create()
    {
    var kjdev_rg = new AzureNative.Resources.ResourceGroup("kjdev-rg", new()
    {
        Location = "westeurope",
        ResourceGroupName = "kjdev-rg",
        Tags = 
        {
            { "environment", "production" },
            { "project", "kjeldsen.dev" },
        },
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var kjdev_logs = new AzureNative.OperationalInsights.Workspace("kjdev-logs", new()
    {
        Features = new AzureNative.OperationalInsights.Inputs.WorkspaceFeaturesArgs
        {
            EnableLogAccessUsingOnlyResourcePermissions = true,
        },
        Location = "westeurope",
        PublicNetworkAccessForIngestion = AzureNative.OperationalInsights.PublicNetworkAccessType.Enabled,
        PublicNetworkAccessForQuery = AzureNative.OperationalInsights.PublicNetworkAccessType.Enabled,
        ResourceGroupName = "kjdev-rg",
        RetentionInDays = 30,
        Sku = new AzureNative.OperationalInsights.Inputs.WorkspaceSkuArgs
        {
            Name = AzureNative.OperationalInsights.WorkspaceSkuNameEnum.PerGB2018,
        },
        Tags = 
        {
            { "environment", "production" },
            { "project", "kjeldsen.dev" },
        },
        WorkspaceCapping = new AzureNative.OperationalInsights.Inputs.WorkspaceCappingArgs
        {
            DailyQuotaGb = 1.0,
        },
        WorkspaceName = "kjdev-logs",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var kjdev_appinsights = new AzureNative.ApplicationInsights.Component("kjdev-appinsights", new()
    {
        ApplicationType = AzureNative.ApplicationInsights.ApplicationType.Web,
        FlowType = AzureNative.ApplicationInsights.FlowType.Bluefield,
        IngestionMode = AzureNative.ApplicationInsights.IngestionMode.LogAnalytics,
        Kind = "web",
        Location = "westeurope",
        PublicNetworkAccessForIngestion = AzureNative.ApplicationInsights.PublicNetworkAccessType.Enabled,
        PublicNetworkAccessForQuery = AzureNative.ApplicationInsights.PublicNetworkAccessType.Enabled,
        RequestSource = AzureNative.ApplicationInsights.RequestSource.Rest,
        ResourceGroupName = "kjdev-rg",
        ResourceName = "kjdev-appinsights",
        RetentionInDays = 90,
        Tags = 
        {
            { "environment", "production" },
            { "project", "kjeldsen.dev" },
        },
        WorkspaceResourceId = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourceGroups/kjdev-rg/providers/Microsoft.OperationalInsights/workspaces/kjdev-logs",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var kjdev_appinsights_umbraco = new AzureNative.ApplicationInsights.Component("kjdev-appinsights-umbraco", new()
    {
        ApplicationType = AzureNative.ApplicationInsights.ApplicationType.Web,
        FlowType = AzureNative.ApplicationInsights.FlowType.Bluefield,
        IngestionMode = AzureNative.ApplicationInsights.IngestionMode.LogAnalytics,
        Kind = "web",
        Location = "westeurope",
        PublicNetworkAccessForIngestion = AzureNative.ApplicationInsights.PublicNetworkAccessType.Enabled,
        PublicNetworkAccessForQuery = AzureNative.ApplicationInsights.PublicNetworkAccessType.Enabled,
        RequestSource = AzureNative.ApplicationInsights.RequestSource.Rest,
        ResourceGroupName = "kjdev-rg",
        ResourceName = "kjdev-appinsights-umbraco",
        RetentionInDays = 90,
        Tags = 
        {
            { "environment", "production" },
            { "project", "kjeldsen.dev" },
        },
        WorkspaceResourceId = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourceGroups/kjdev-rg/providers/Microsoft.OperationalInsights/workspaces/kjdev-logs",
    }, new CustomResourceOptions
    {
        Protect = true,
    });
    }
}
