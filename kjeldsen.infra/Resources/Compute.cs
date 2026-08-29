using Pulumi;
using AzureNative = Pulumi.AzureNative;

namespace Kjeldsen.Infra;

/// <summary>
/// App Service plans and the two web apps (Nuxt frontend, Umbraco backoffice).
/// </summary>
public static class Compute
{
    public static void Create()
    {
    var kjdev_asp_frontend = new AzureNative.Web.AppServicePlan("kjdev-asp-frontend", new()
    {
        AsyncScalingEnabled = false,
        ElasticScaleEnabled = false,
        HyperV = false,
        IsCustomMode = false,
        IsSpot = false,
        IsXenon = false,
        Kind = "linux",
        Location = "West Europe",
        MaximumElasticWorkerCount = 1,
        Name = "kjdev-asp-frontend",
        PerSiteScaling = false,
        Reserved = true,
        ResourceGroupName = "kjdev-rg",
        Sku = new AzureNative.Web.Inputs.SkuDescriptionArgs
        {
            Capacity = 1,
            Family = "B",
            Name = "B1",
            Size = "B1",
            Tier = "Basic",
        },
        Tags = 
        {
            { "environment", "production" },
            { "project", "kjeldsen.dev" },
        },
        TargetWorkerCount = 0,
        TargetWorkerSizeId = 0,
        ZoneRedundant = false,
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var kjdev_asp_backend = new AzureNative.Web.AppServicePlan("kjdev-asp-backend", new()
    {
        AsyncScalingEnabled = false,
        ElasticScaleEnabled = false,
        HyperV = false,
        IsCustomMode = false,
        IsSpot = false,
        IsXenon = false,
        Kind = "linux",
        Location = "West Europe",
        MaximumElasticWorkerCount = 1,
        Name = "kjdev-asp-backend",
        PerSiteScaling = false,
        Reserved = true,
        ResourceGroupName = "kjdev-rg",
        Sku = new AzureNative.Web.Inputs.SkuDescriptionArgs
        {
            Capacity = 1,
            Family = "B",
            Name = "B1",
            Size = "B1",
            Tier = "Basic",
        },
        Tags = 
        {
            { "environment", "production" },
            { "project", "kjeldsen.dev" },
        },
        TargetWorkerCount = 0,
        TargetWorkerSizeId = 0,
        ZoneRedundant = false,
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var kjdev_app_frontend = new AzureNative.Web.WebApp("kjdev-app-frontend", new()
    {
        ClientAffinityEnabled = true,
        ClientAffinityProxyEnabled = false,
        ClientCertEnabled = false,
        ClientCertMode = AzureNative.Web.ClientCertMode.Required,
        ContainerSize = 0,
        CustomDomainVerificationId = "BFA1B76815118420A6F5F74178088434C0BF88A8FBE88604CA3BA2D384F941ED",
        DailyMemoryTimeQuota = 0,
        Enabled = true,
        EndToEndEncryptionEnabled = false,
        HostNameSslStates = new[]
        {
            new AzureNative.Web.Inputs.HostNameSslStateArgs
            {
                HostType = AzureNative.Web.HostType.Standard,
                Name = "kjdev-app-frontend.azurewebsites.net",
                SslState = AzureNative.Web.SslState.Disabled,
            },
            new AzureNative.Web.Inputs.HostNameSslStateArgs
            {
                HostType = AzureNative.Web.HostType.Repository,
                Name = "kjdev-app-frontend.scm.azurewebsites.net",
                SslState = AzureNative.Web.SslState.Disabled,
            },
        },
        HostNamesDisabled = false,
        HttpsOnly = true,
        HyperV = false,
        IpMode = AzureNative.Web.IPMode.IPv4,
        IsXenon = false,
        KeyVaultReferenceIdentity = "SystemAssigned",
        Kind = "app,linux",
        Location = "West Europe",
        Name = "kjdev-app-frontend",
        OutboundVnetRouting = new AzureNative.Web.Inputs.OutboundVnetRoutingArgs
        {
            AllTraffic = false,
            ApplicationTraffic = false,
            BackupRestoreTraffic = false,
            ContentShareTraffic = false,
            ImagePullTraffic = false,
        },
        PublicNetworkAccess = "Enabled",
        RedundancyMode = AzureNative.Web.RedundancyMode.None,
        Reserved = true,
        ResourceGroupName = "kjdev-rg",
        ScmSiteAlsoStopped = false,
        ServerFarmId = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourceGroups/kjdev-rg/providers/Microsoft.Web/serverfarms/kjdev-asp-frontend",
        SiteConfig = new AzureNative.Web.Inputs.SiteConfigArgs
        {
            AcrUseManagedIdentityCreds = false,
            AlwaysOn = false,
            AppCommandLine = "",
            AutoHealEnabled = false,
            DefaultDocuments = new[]
            {
                "Default.htm",
                "Default.html",
                "Default.asp",
                "index.htm",
                "index.html",
                "iisstart.htm",
                "default.aspx",
                "index.php",
                "hostingstart.html",
            },
            DetailedErrorLoggingEnabled = false,
            ElasticWebAppScaleLimit = 0,
            FtpsState = AzureNative.Web.FtpsState.FtpsOnly,
            FunctionsRuntimeScaleMonitoringEnabled = false,
            Http20Enabled = true,
            Http20ProxyFlag = 0,
            HttpLoggingEnabled = false,
            IpSecurityRestrictions = new[]
            {
                new AzureNative.Web.Inputs.IpSecurityRestrictionArgs
                {
                    Action = "Allow",
                    Description = "Allow all access",
                    IpAddress = "Any",
                    Name = "Allow all",
                    Priority = 2147483647,
                },
            },
            LinuxFxVersion = "NODE|22-lts",
            LoadBalancing = AzureNative.Web.SiteLoadBalancing.LeastRequests,
            LocalMySqlEnabled = false,
            LogsDirectorySizeLimit = 35,
            ManagedPipelineMode = AzureNative.Web.ManagedPipelineMode.Integrated,
            MinTlsVersion = AzureNative.Web.SupportedTlsVersions.SupportedTlsVersions_1_2,
            MinimumElasticInstanceCount = 1,
            NetFrameworkVersion = "v4.0",
            NodeVersion = "",
            NumberOfWorkers = 1,
            PhpVersion = "",
            PowerShellVersion = "",
            PreWarmedInstanceCount = 0,
            PublishingUsername = "$kjdev-app-frontend",
            PythonVersion = "",
            RemoteDebuggingEnabled = false,
            RemoteDebuggingVersion = "VS2022",
            RequestTracingEnabled = false,
            ScmIpSecurityRestrictions = new[]
            {
                new AzureNative.Web.Inputs.IpSecurityRestrictionArgs
                {
                    Action = "Allow",
                    Description = "Allow all access",
                    IpAddress = "Any",
                    Name = "Allow all",
                    Priority = 2147483647,
                },
            },
            ScmIpSecurityRestrictionsUseMain = false,
            ScmMinTlsVersion = AzureNative.Web.SupportedTlsVersions.SupportedTlsVersions_1_2,
            ScmType = AzureNative.Web.ScmType.VSTSRM,
            Use32BitWorkerProcess = true,
            VirtualApplications = new[]
            {
                new AzureNative.Web.Inputs.VirtualApplicationArgs
                {
                    PhysicalPath = "site\\wwwroot",
                    PreloadEnabled = false,
                    VirtualPath = "/",
                },
            },
            VnetName = "",
            VnetPrivatePortsCount = 0,
            VnetRouteAllEnabled = false,
            WebSocketsEnabled = false,
            WindowsFxVersion = "NODE|22-lts",
        },
        StorageAccountRequired = false,
        Tags = 
        {
            { "environment", "production" },
            { "project", "kjeldsen.dev" },
        },
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var kjdev_app_backend = new AzureNative.Web.WebApp("kjdev-app-backend", new()
    {
        AutoGeneratedDomainNameLabelScope = AzureNative.Web.AutoGeneratedDomainNameLabelScope.TenantReuse,
        ClientAffinityEnabled = false,
        ClientAffinityProxyEnabled = false,
        ClientCertEnabled = false,
        ClientCertMode = AzureNative.Web.ClientCertMode.Required,
        ContainerSize = 0,
        CustomDomainVerificationId = "BFA1B76815118420A6F5F74178088434C0BF88A8FBE88604CA3BA2D384F941ED",
        DailyMemoryTimeQuota = 0,
        Enabled = true,
        EndToEndEncryptionEnabled = false,
        HostNameSslStates = new[]
        {
            new AzureNative.Web.Inputs.HostNameSslStateArgs
            {
                HostType = AzureNative.Web.HostType.Repository,
                Name = "kjdev-app-backend-eqhhguczfrh6gndg.scm.westeurope-01.azurewebsites.net",
                SslState = AzureNative.Web.SslState.Disabled,
            },
            new AzureNative.Web.Inputs.HostNameSslStateArgs
            {
                HostType = AzureNative.Web.HostType.Standard,
                Name = "kjdev-app-backend-eqhhguczfrh6gndg.westeurope-01.azurewebsites.net",
                SslState = AzureNative.Web.SslState.Disabled,
            },
            new AzureNative.Web.Inputs.HostNameSslStateArgs
            {
                HostType = AzureNative.Web.HostType.Standard,
                Name = "umbraco.kjeldsen.dev",
                SslState = AzureNative.Web.SslState.SniEnabled,
                Thumbprint = "AFF907E46235F4D96F1250ACC346CEAE86A02621",
            },
        },
        HostNamesDisabled = false,
        HttpsOnly = true,
        HyperV = false,
        Identity = new AzureNative.Web.Inputs.ManagedServiceIdentityArgs
        {
            Type = AzureNative.Web.ManagedServiceIdentityType.SystemAssigned,
        },
        IpMode = AzureNative.Web.IPMode.IPv4,
        IsXenon = false,
        KeyVaultReferenceIdentity = "SystemAssigned",
        Kind = "app,linux",
        Location = "West Europe",
        Name = "kjdev-app-backend",
        OutboundVnetRouting = new AzureNative.Web.Inputs.OutboundVnetRoutingArgs
        {
            AllTraffic = false,
            ApplicationTraffic = false,
            BackupRestoreTraffic = false,
            ContentShareTraffic = false,
            ImagePullTraffic = false,
        },
        PublicNetworkAccess = "Enabled",
        RedundancyMode = AzureNative.Web.RedundancyMode.None,
        Reserved = true,
        ResourceGroupName = "kjdev-rg",
        ScmSiteAlsoStopped = false,
        ServerFarmId = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourceGroups/kjdev-rg/providers/Microsoft.Web/serverfarms/kjdev-asp-backend",
        SiteConfig = new AzureNative.Web.Inputs.SiteConfigArgs
        {
            AcrUseManagedIdentityCreds = false,
            AlwaysOn = false,
            AppCommandLine = "",
            AutoHealEnabled = false,
            DefaultDocuments = new[]
            {
                "Default.htm",
                "Default.html",
                "Default.asp",
                "index.htm",
                "index.html",
                "iisstart.htm",
                "default.aspx",
                "index.php",
                "hostingstart.html",
            },
            DetailedErrorLoggingEnabled = false,
            ElasticWebAppScaleLimit = 0,
            FtpsState = AzureNative.Web.FtpsState.FtpsOnly,
            FunctionsRuntimeScaleMonitoringEnabled = false,
            Http20Enabled = true,
            Http20ProxyFlag = 0,
            HttpLoggingEnabled = true,
            IpSecurityRestrictions = new[]
            {
                new AzureNative.Web.Inputs.IpSecurityRestrictionArgs
                {
                    Action = "Allow",
                    Description = "Allow all access",
                    IpAddress = "Any",
                    Name = "Allow all",
                    Priority = 2147483647,
                },
            },
            LinuxFxVersion = "DOTNETCORE|10.0",
            LoadBalancing = AzureNative.Web.SiteLoadBalancing.LeastRequests,
            LocalMySqlEnabled = false,
            LogsDirectorySizeLimit = 35,
            ManagedPipelineMode = AzureNative.Web.ManagedPipelineMode.Integrated,
            ManagedServiceIdentityId = 34056,
            MinTlsVersion = AzureNative.Web.SupportedTlsVersions.SupportedTlsVersions_1_2,
            MinimumElasticInstanceCount = 1,
            NetFrameworkVersion = "v4.0",
            NodeVersion = "",
            NumberOfWorkers = 1,
            PhpVersion = "",
            PowerShellVersion = "",
            PreWarmedInstanceCount = 0,
            PythonVersion = "",
            RemoteDebuggingEnabled = false,
            RemoteDebuggingVersion = "VS2022",
            RequestTracingEnabled = false,
            ScmIpSecurityRestrictions = new[]
            {
                new AzureNative.Web.Inputs.IpSecurityRestrictionArgs
                {
                    Action = "Allow",
                    Description = "Allow all access",
                    IpAddress = "Any",
                    Name = "Allow all",
                    Priority = 2147483647,
                },
            },
            ScmIpSecurityRestrictionsUseMain = false,
            ScmMinTlsVersion = AzureNative.Web.SupportedTlsVersions.SupportedTlsVersions_1_2,
            ScmType = AzureNative.Web.ScmType.VSTSRM,
            Use32BitWorkerProcess = true,
            VirtualApplications = new[]
            {
                new AzureNative.Web.Inputs.VirtualApplicationArgs
                {
                    PhysicalPath = "site\\wwwroot",
                    PreloadEnabled = false,
                    VirtualPath = "/",
                },
            },
            VnetName = "",
            VnetPrivatePortsCount = 0,
            VnetRouteAllEnabled = false,
            WebSocketsEnabled = false,
        },
        StorageAccountRequired = false,
        Tags = 
        {
            { "environment", "production" },
            { "project", "kjeldsen.dev" },
        },
    }, new CustomResourceOptions
    {
        Protect = true,
    });
    }
}
