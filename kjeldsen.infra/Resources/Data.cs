using Pulumi;
using AzureNative = Pulumi.AzureNative;

namespace Kjeldsen.Infra;

/// <summary>
/// Storage, SQL and Key Vault.
///
/// The Key Vault access policies and the SQL server are adopted as they exist. The previous
/// TypeScript program generated the SQL admin password with RandomPassword, which would have
/// rotated the live credential on any run; the password is deliberately not authored here.
/// </summary>
public static class Data
{
    public static void Create()
    {
    var kjdevstorage = new AzureNative.Storage.StorageAccount("kjdevstorage", new()
    {
        AccessTier = AzureNative.Storage.AccessTier.Hot,
        AccountName = "kjdevstorage",
        AllowBlobPublicAccess = false,
        AllowCrossTenantReplication = false,
        EnableHttpsTrafficOnly = true,
        Encryption = new AzureNative.Storage.Inputs.EncryptionArgs
        {
            KeySource = AzureNative.Storage.KeySource.Microsoft_Storage,
            Services = new AzureNative.Storage.Inputs.EncryptionServicesArgs
            {
                Blob = new AzureNative.Storage.Inputs.EncryptionServiceArgs
                {
                    Enabled = true,
                    KeyType = AzureNative.Storage.KeyType.Account,
                },
                File = new AzureNative.Storage.Inputs.EncryptionServiceArgs
                {
                    Enabled = true,
                    KeyType = AzureNative.Storage.KeyType.Account,
                },
            },
        },
        Kind = AzureNative.Storage.Kind.StorageV2,
        Location = "westeurope",
        MinimumTlsVersion = AzureNative.Storage.MinimumTlsVersion.TLS1_0,
        NetworkRuleSet = new AzureNative.Storage.Inputs.NetworkRuleSetArgs
        {
            Bypass = AzureNative.Storage.Bypass.None,
            DefaultAction = AzureNative.Storage.DefaultAction.Allow,
        },
        ResourceGroupName = "kjdev-rg",
        Sku = new AzureNative.Storage.Inputs.SkuArgs
        {
            Name = AzureNative.Storage.SkuName.Standard_LRS,
        },
        Tags = 
        {
            { "environment", "production" },
            { "project", "kjeldsen.dev" },
        },
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var kjdevblob = new AzureNative.Storage.BlobContainer("kjdevblob", new()
    {
        AccountName = "kjdevstorage",
        ContainerName = "kjdevblob",
        DefaultEncryptionScope = "$account-encryption-key",
        DenyEncryptionScopeOverride = false,
        PublicAccess = AzureNative.Storage.PublicAccess.None,
        ResourceGroupName = "kjdev-rg",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var kjdev_sql = new AzureNative.Sql.Server("kjdev-sql", new()
    {
        AdministratorLogin = "sqladminuser",
        Location = "westeurope",
        MinimalTlsVersion = AzureNative.Sql.MinimalTlsVersion.MinimalTlsVersion_1_2,
        PublicNetworkAccess = AzureNative.Sql.ServerPublicNetworkAccessFlag.Enabled,
        ResourceGroupName = "kjdev-rg",
        RestrictOutboundNetworkAccess = AzureNative.Sql.ServerNetworkAccessFlag.Disabled,
        ServerName = "kjdev-sql",
        Tags = 
        {
            { "environment", "production" },
            { "project", "kjeldsen.dev" },
        },
        Version = "12.0",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var kjdevsqldbumbraco = new AzureNative.Sql.Database("kjdevsqldbumbraco", new()
    {
        AvailabilityZone = AzureNative.Sql.AvailabilityZoneType.NoPreference,
        CatalogCollation = AzureNative.Sql.CatalogCollationType.SQL_Latin1_General_CP1_CI_AS,
        Collation = "SQL_Latin1_General_CP1_CI_AS",
        DatabaseName = "kjdevsqldbumbraco",
        IsLedgerOn = false,
        Location = "westeurope",
        MaintenanceConfigurationId = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/providers/Microsoft.Maintenance/publicMaintenanceConfigurations/SQL_Default",
        MaxSizeBytes = 2147483648,
        ReadScale = AzureNative.Sql.DatabaseReadScale.Disabled,
        RequestedBackupStorageRedundancy = AzureNative.Sql.BackupStorageRedundancy.Geo,
        ResourceGroupName = "kjdev-rg",
        ServerName = "kjdev-sql",
        Sku = new AzureNative.Sql.Inputs.SkuArgs
        {
            Capacity = 10,
            Name = "Standard",
            Tier = "Standard",
        },
        Tags = 
        {
            { "environment", "production" },
            { "project", "kjeldsen.dev" },
        },
        ZoneRedundant = false,
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var kjdevkv = new AzureNative.KeyVault.Vault("kjdevkv", new()
    {
        Location = "westeurope",
        Properties = new AzureNative.KeyVault.Inputs.VaultPropertiesArgs
        {
            AccessPolicies = new[]
            {
                new AzureNative.KeyVault.Inputs.AccessPolicyEntryArgs
                {
                    ObjectId = "6e97df28-d27d-42a4-ac98-b0f1d391fa54",
                    Permissions = new AzureNative.KeyVault.Inputs.PermissionsArgs
                    {
                        Certificates = 
                        {
                            "Get",
                            "List",
                            "Update",
                            "Create",
                            "Import",
                            "Delete",
                            "Recover",
                            "Backup",
                            "Restore",
                            "ManageContacts",
                            "ManageIssuers",
                            "GetIssuers",
                            "ListIssuers",
                            "SetIssuers",
                            "DeleteIssuers",
                        },
                        Keys = 
                        {
                            "Get",
                            "List",
                            "Update",
                            "Create",
                            "Import",
                            "Delete",
                            "Recover",
                            "Backup",
                            "Restore",
                            "GetRotationPolicy",
                            "SetRotationPolicy",
                            "Rotate",
                        },
                        Secrets = 
                        {
                            "Get",
                            "List",
                            "Set",
                            "Delete",
                            "Recover",
                            "Backup",
                            "Restore",
                        },
                    },
                    TenantId = "10a49740-5b2d-41c8-aff0-a9acb8ad414a",
                },
                new AzureNative.KeyVault.Inputs.AccessPolicyEntryArgs
                {
                    ObjectId = "60a487c9-f564-4abe-b150-9fa91b8802d8",
                    Permissions = new AzureNative.KeyVault.Inputs.PermissionsArgs
                    {
                        Certificates = 
                        {
                            "Get",
                            "List",
                            "Update",
                            "Create",
                            "Import",
                            "Delete",
                            "Recover",
                            "Backup",
                            "Restore",
                            "ManageContacts",
                            "ManageIssuers",
                            "GetIssuers",
                            "ListIssuers",
                            "SetIssuers",
                            "DeleteIssuers",
                        },
                        Keys = 
                        {
                            "Get",
                            "List",
                            "Update",
                            "Create",
                            "Import",
                            "Delete",
                            "Recover",
                            "Backup",
                            "Restore",
                            "GetRotationPolicy",
                            "SetRotationPolicy",
                            "Rotate",
                        },
                        Secrets = 
                        {
                            "Get",
                            "List",
                            "Set",
                            "Delete",
                            "Recover",
                            "Backup",
                            "Restore",
                        },
                    },
                    TenantId = "10a49740-5b2d-41c8-aff0-a9acb8ad414a",
                },
                new AzureNative.KeyVault.Inputs.AccessPolicyEntryArgs
                {
                    ObjectId = "3d29583b-52e9-4d88-8126-081308c032ce",
                    Permissions = new AzureNative.KeyVault.Inputs.PermissionsArgs
                    {
                        Certificates = 
                        {
                            "Get",
                            "List",
                            "Update",
                            "Create",
                            "Import",
                            "Delete",
                            "Recover",
                            "Backup",
                            "Restore",
                            "ManageContacts",
                            "ManageIssuers",
                            "GetIssuers",
                            "ListIssuers",
                            "SetIssuers",
                            "DeleteIssuers",
                        },
                        Keys = 
                        {
                            "Get",
                            "List",
                            "Update",
                            "Create",
                            "Import",
                            "Delete",
                            "Recover",
                            "Backup",
                            "Restore",
                            "GetRotationPolicy",
                            "SetRotationPolicy",
                            "Rotate",
                        },
                        Secrets = 
                        {
                            "Get",
                            "List",
                            "Set",
                            "Delete",
                            "Recover",
                            "Backup",
                            "Restore",
                        },
                    },
                    TenantId = "10a49740-5b2d-41c8-aff0-a9acb8ad414a",
                },
            },
            EnableRbacAuthorization = false,
            EnableSoftDelete = true,
            EnabledForDeployment = true,
            EnabledForDiskEncryption = true,
            EnabledForTemplateDeployment = true,
            PublicNetworkAccess = "Enabled",
            Sku = new AzureNative.KeyVault.Inputs.SkuArgs
            {
                Family = AzureNative.KeyVault.SkuFamily.A,
                Name = AzureNative.KeyVault.SkuName.Standard,
            },
            SoftDeleteRetentionInDays = 90,
            TenantId = "10a49740-5b2d-41c8-aff0-a9acb8ad414a",
        },
        ResourceGroupName = "kjdev-rg",
        Tags = 
        {
            { "environment", "production" },
            { "project", "kjeldsen.dev" },
        },
        VaultName = "kjdevkv",
    }, new CustomResourceOptions
    {
        Protect = true,
    });
    }
}
