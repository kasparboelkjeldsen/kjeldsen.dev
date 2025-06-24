import * as azureNative from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";
import { ResourceType, ResourceVars } from "../vars";

export function createResourceGroup(rsv: ResourceVars, location: string, tags: Record<string, string>) {
    return new azureNative.resources.ResourceGroup(rsv.name(ResourceType.ResourceGroup), {
        resourceGroupName: rsv.name(ResourceType.ResourceGroup),
        location,
        tags,
    });
}
