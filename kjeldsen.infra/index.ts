import * as pulumi from "@pulumi/pulumi";
import * as azureNative from "@pulumi/azure-native";
import * as random from "@pulumi/random";

import { ResourceType, ResourceVars } from "./vars";
import { createResourceGroup } from "./resources/resourceGroup";
import { createStorage } from "./resources/storage";
import { createSql } from "./resources/sql";
import { createKeyVault } from "./resources/keyVault";
import { createAppServicePlans, createWebApps } from "./resources/appService";
import { createDns } from "./resources/dns";
import { createCdn } from "./resources/cdn";
import { createKeyVaultSecrets } from "./resources/secrets";

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
const resourceGroup = createResourceGroup(rsv, location, tags);

// 🔹 Storage
const { storageAccount, blobContainer } = createStorage(rsv, resourceGroup.name, location, tags);

// 🔹 SQL
const { sqlPassword, sqlServer, sqlDatabase, connectionString } = createSql(rsv, resourceGroup.name, location, tags);

// 🔹 Key Vault
const keyVault = createKeyVault(rsv, resourceGroup.name, location, tags);

// 🔹 App Service Plans
const { frontendPlan, backofficePlan } = createAppServicePlans(rsv, resourceGroup.name, location, tags);

// 🔹 App Services
const { frontendApp, backofficeApp } = createWebApps(
    rsv,
    resourceGroup.name,
    location,
    frontendPlan.id,
    backofficePlan.id,
    connectionString,
    tags
);

// 🔹 DNS
const kjeldsenDevZone = createDns(resourceGroup.name, tags.project);

// 🔹 CDN
const kjdevFrontdoor = createCdn(resourceGroup.name);

// 🔹 Secrets
createKeyVaultSecrets(keyVault, resourceGroup.name, storageAccount, sqlPassword.result, connectionString);

// 🔹 Outputs
export const resourceGroupName = resourceGroup.name;
export const storageAccountName = storageAccount.name;
export const containerName = blobContainer.name;
export const sqlConnectionString = pulumi.secret(connectionString);
export const keyVaultName = keyVault.name;
