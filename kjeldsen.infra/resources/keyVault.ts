import * as azureNative from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";
import { ResourceType, ResourceVars } from "../vars";

export function createKeyVault(rsv: ResourceVars, resourceGroupName: pulumi.Input<string>, location: pulumi.Input<string>, tags: Record<string, string>) {
    return new azureNative.keyvault.Vault(rsv.name(ResourceType.KeyVault), {
        vaultName: rsv.compact(ResourceType.KeyVault),
        location,
        resourceGroupName,
        properties: {
            tenantId: azureNative.authorization.getClientConfig().then(c => c.tenantId),
            sku: { family: "A", name: "standard" },
            accessPolicies: [],
            enabledForDeployment: true,
            enabledForTemplateDeployment: true,
            enabledForDiskEncryption: true,
        },
        tags,
    }, {
        protect: true,
    });
}
