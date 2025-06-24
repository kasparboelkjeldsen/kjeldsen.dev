import * as azureNative from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";
import { ResourceType, ResourceVars } from "../vars";

export function createStorage(rsv: ResourceVars, resourceGroupName: pulumi.Input<string>, location: string, tags: Record<string, string>) {
    const storageAccount = new azureNative.storage.StorageAccount(rsv.name(ResourceType.StorageAccount), {
        accountName: rsv.compact(ResourceType.StorageAccount),
        resourceGroupName,
        location,
        sku: { name: "Standard_LRS" },
        kind: "StorageV2",
        tags,
    });

    const blobContainer = new azureNative.storage.BlobContainer(rsv.name(ResourceType.BlobContainer), {
        accountName: storageAccount.name,
        containerName: rsv.compact(ResourceType.BlobContainer),
        publicAccess: azureNative.storage.PublicAccess.None,
        resourceGroupName,
    });

    return { storageAccount, blobContainer };
}
