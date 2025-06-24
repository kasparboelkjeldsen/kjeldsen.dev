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
        sku: { tier: "Free", name: "F1" },
        tags,
    });

    const backofficePlan = new azureNative.web.AppServicePlan(rsv.name(ResourceType.AppServicePlan, "backoffice"), {
        name: rsv.name(ResourceType.AppServicePlan, "backoffice"),
        resourceGroupName,
        location,
        kind: "App",
        reserved: false,
        sku: { tier: "Shared", name: "D1" },
        tags,
    });

    return { frontendPlan, backofficePlan };
}

export function createWebApps(rsv: ResourceVars, resourceGroupName: pulumi.Input<string>, location: pulumi.Input<string>, frontendPlanId: pulumi.Input<string>, backofficePlanId: pulumi.Input<string>, connectionString: pulumi.Output<string>, tags: Record<string, string>) {
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

    const backofficeApp = new azureNative.web.WebApp(rsv.name(ResourceType.AppService, "backoffice"), {
        name: rsv.name(ResourceType.AppService, "backoffice"),
        resourceGroupName,
        location,
        serverFarmId: backofficePlanId,
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

    return { frontendApp, backofficeApp };
}
