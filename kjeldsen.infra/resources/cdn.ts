import * as azureNative from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export function createCdn(resourceGroupName: pulumi.Input<string>) {
    return new azureNative.cdn.Profile("kjdevFrontdoor", {
        location: "Global",
        originResponseTimeoutSeconds: 60,
        profileName: "kjdev-fd",
        resourceGroupName,
        sku: {
            name: azureNative.cdn.SkuName.Standard_AzureFrontDoor,
        },
    }, {
        protect: true,
    });
}
