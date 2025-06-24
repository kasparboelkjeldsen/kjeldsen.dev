import * as azureNative from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export function createDns(resourceGroupName: pulumi.Input<string>, project: string) {
    return new azureNative.network.Zone("kjeldsenDevZone", {
        location: "global",
        resourceGroupName,
        zoneName: project,
        zoneType: azureNative.network.ZoneType.Public,
    }, {
        protect: true,
    });
}
