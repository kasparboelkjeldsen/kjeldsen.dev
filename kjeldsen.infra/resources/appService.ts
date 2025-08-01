import * as azureNative from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";
import { ResourceType, ResourceVars } from "../vars";

export function createAppServicePlans(rsv: ResourceVars, resourceGroupName: pulumi.Input<string>, location: pulumi.Input<string>, tags: Record<string, string>) {
    const frontendPlan = new azureNative.web.AppServicePlan(rsv.name(ResourceType.AppServicePlan, "frontend"), {
        name: rsv.name(ResourceType.AppServicePlan, "frontend"),
        resourceGroupName,
        location,
        kind: "App",
        reserved: true,
        sku: { tier: "Basic", name: "B1" },
        tags,
    });

    const backofficePlan = new azureNative.web.AppServicePlan(rsv.name(ResourceType.AppServicePlan, "backend"), {
        name: rsv.name(ResourceType.AppServicePlan, "backend"),
        resourceGroupName,
        location,
        kind: "Linux", // Required for Linux apps
        reserved: true, // Required for Linux plans
        sku: {
            tier: "Basic",
            name: "B1",
        },
        tags,
    });

    return { frontendPlan, backofficePlan };
}

export function createWebApps(rsv: ResourceVars, resourceGroupName: pulumi.Input<string>, location: pulumi.Input<string>, frontendPlanId: pulumi.Input<string>, backofficePlanId: pulumi.Input<string>, connectionString: pulumi.Output<string>, blobConnectionString: pulumi.Output<string>, tags: Record<string, string>) {
    const frontendApp = new azureNative.web.WebApp(rsv.name(ResourceType.AppService, "frontend"), {
        name: rsv.name(ResourceType.AppService, "frontend"),
        resourceGroupName,
        location,
        serverFarmId: frontendPlanId,
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

    const backofficeApp = new azureNative.web.WebApp(rsv.name(ResourceType.AppService, "backend"), {
        name: rsv.name(ResourceType.AppService, "backend"),
        resourceGroupName,
        location,
        serverFarmId: backofficePlanId,
        kind: "app,linux",
        reserved: true, // marks it as a Linux app
        identity: {
            type: azureNative.web.ManagedServiceIdentityType.SystemAssigned,
        },
        httpsOnly: true,
        clientAffinityEnabled: false,
        clientCertEnabled: false,
        clientCertMode: azureNative.web.ClientCertMode.Required,
        siteConfig: {
            linuxFxVersion: "DOTNETCORE|9.0",
            minTlsVersion: azureNative.web.SupportedTlsVersions.SupportedTlsVersions_1_2,
            appSettings: [
                { name: "WEBSITES_ENABLE_APP_SERVICE_STORAGE", value: "true" },
                { name: "ASPNETCORE_ENVIRONMENT", value: "Production" },
            ],
            scmIpSecurityRestrictionsUseMain: false,
        },
        tags: {
            ...tags,
        },
    });


    return { frontendApp, backofficeApp };
}
