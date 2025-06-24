import * as azureNative from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export function getStorageConnectionString(accountName: pulumi.Input<string>, resourceGroupName: pulumi.Input<string>): pulumi.Output<string> {
    const keys = azureNative.storage.listStorageAccountKeysOutput({
        accountName,
        resourceGroupName,
    });
    return pulumi.interpolate`DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${keys.keys[0].value};EndpointSuffix=core.windows.net`;
}
