import * as pulumi from "@pulumi/pulumi";
import * as azureNative from "@pulumi/azure-native";
import * as cdn from "@pulumi/azure-native/cdn";
import * as random from "@pulumi/random";

import { ResourceType, ResourceVars } from "./vars";

// 🔹 Config and Tags
const config = new pulumi.Config("azure");
const location = config.require("location");
const prefix = "kjdev";
const tags = {
    project: "kjeldsen.dev",
    environment: "production",
};
const rsv = new ResourceVars(prefix);

// 🔹 Resource Group
const resourceGroup = new azureNative.resources.ResourceGroup(rsv.name(ResourceType.ResourceGroup), {
    resourceGroupName: rsv.name(ResourceType.ResourceGroup),
    location,
    tags,
});

// 🔹 Storage Account & Container
const storageAccount = new azureNative.storage.StorageAccount(rsv.name(ResourceType.StorageAccount), {
    accountName: rsv.compact(ResourceType.StorageAccount),
    resourceGroupName: resourceGroup.name,
    location,
    sku: {
        name: "Standard_LRS",
    },
    kind: "StorageV2",
    tags,
});

const blobContainer = new azureNative.storage.BlobContainer(rsv.name(ResourceType.BlobContainer), {
    accountName: storageAccount.name,
    containerName: rsv.compact(ResourceType.BlobContainer),
    publicAccess: azureNative.storage.PublicAccess.None,
    resourceGroupName: resourceGroup.name,
});

// 🔹 SQL Admin Password
const sqlPassword = new random.RandomPassword("sql-password", {
    length: 24,
    special: true,
    overrideSpecial: "_%@",
});

// 🔹 SQL Server (azure-native)
const sqlServer = new azureNative.sql.Server(rsv.name(ResourceType.SqlServer), {
    serverName: rsv.name(ResourceType.SqlServer),
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    administratorLogin: "sqladminuser",
    administratorLoginPassword: sqlPassword.result,
    version: "12.0",
    tags,
});

// 🔹 SQL Database (azure-native)
const sqlDatabase = new azureNative.sql.Database(rsv.name(ResourceType.SqlDb, "umbraco"), {
    databaseName: rsv.compact(ResourceType.SqlDb, "umbraco"),
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    serverName: sqlServer.name,
    sku: {
        name: "Basic",
        tier: "Basic",
    },
    maxSizeBytes: 2147483648,
    tags,
});

// 🔹 SQL Connection String
const connectionString = pulumi.interpolate`Server=tcp:${sqlServer.name}.database.windows.net,1433;Initial Catalog=${sqlDatabase.name};Persist Security Info=False;User ID=sqladminuser;Password=${sqlPassword.result};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;`;

// 🔹 Key Vault
const keyVault = new azureNative.keyvault.Vault(rsv.name(ResourceType.KeyVault), {
    vaultName: rsv.compact(ResourceType.KeyVault),
    location: resourceGroup.location,
    resourceGroupName: resourceGroup.name,
    properties: {
        tenantId: azureNative.authorization.getClientConfig().then(c => c.tenantId),
        sku: {
            family: "A",
            name: "standard",
        },
        accessPolicies: [], // Add if needed
        //enablePurgeProtection: false,
        enabledForDeployment: true,
        enabledForTemplateDeployment: true,
        enabledForDiskEncryption: true,
    },
    tags,
});

// 🔹 App Service Plan - Frontend
const frontendPlan = new azureNative.web.AppServicePlan(rsv.name(ResourceType.AppServicePlan, "frontend"), {
    name: rsv.name(ResourceType.AppServicePlan, "frontend"),
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    kind: "App",
    reserved: true,
    sku: {
        tier: "Free",
        name: "F1",
    },
    tags,
});

// 🔹 App Service Plan - Backoffice
const backofficePlan = new azureNative.web.AppServicePlan(rsv.name(ResourceType.AppServicePlan, "backoffice"), {
    name: rsv.name(ResourceType.AppServicePlan, "backoffice"),
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    kind: "App",
    reserved: false,
    sku: {
        tier: "Shared",
        name: "D1",
    },
    tags,
});

// 🔹 App Services
const frontendApp = new azureNative.web.WebApp(rsv.name(ResourceType.AppService, "frontend"), {
    name: rsv.name(ResourceType.AppService, "frontend"),
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    serverFarmId: frontendPlan.id,
    siteConfig: {
        windowsFxVersion: "NODE|22-lts",
        appSettings: [
            { name: "WEBSITES_ENABLE_APP_SERVICE_STORAGE", value: "false" },
            { name: "WEBSITES_PORT", value: "3000" },
        ],
    },
    httpsOnly: true,
    tags,
});

const backofficeApp = new azureNative.web.WebApp(rsv.name(ResourceType.AppService, "backoffice"), {
    name: rsv.name(ResourceType.AppService, "backoffice"),
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    serverFarmId: backofficePlan.id,
    siteConfig: {
        windowsFxVersion: "DOTNETCORE|9.0",
        appSettings: [
            { name: "WEBSITES_ENABLE_APP_SERVICE_STORAGE", value: "true" },
            { name: "ConnectionStrings__umbracoDbDSN", value: connectionString },
            { name: "ASPNETCORE_ENVIRONMENT", value: "Production" },
        ],
    },
    httpsOnly: true,
    tags,
});



// 🔹 Secrets
const vaultName = keyVault.name;
const vaultId = keyVault.id;
const keyVaultSecrets = [
    {
        name: "UmbracoPrimaryStorageKey",
        value: storageAccount.primaryEndpoints.apply(() => "<fetch manually if needed>"),
    },
    {
        name: "UmbracoSqlUsername",
        value: "sqladminuser",
    },
    {
        name: "UmbracoSqlPassword",
        value: sqlPassword.result,
    },
    {
        name: "UmbracoSqlConnectionString",
        value: connectionString,
    },
];

for (const secret of keyVaultSecrets) {
    new azureNative.keyvault.Secret(secret.name, {
        secretName: secret.name,
        properties: {
            value: secret.value,
        },
        vaultName,
        resourceGroupName: resourceGroup.name,
    });
}

// 🔹 Outputs
export const resourceGroupName = resourceGroup.name;
export const storageAccountName = storageAccount.name;
export const containerName = blobContainer.name;
export const sqlConnectionString = pulumi.secret(connectionString);
export const keyVaultName = keyVault.name;
