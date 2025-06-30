import * as azureNative from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";

export function createKeyVaultSecrets(keyVault: azureNative.keyvault.Vault, resourceGroupName: pulumi.Input<string>, storageAccount: azureNative.storage.StorageAccount, sqlPassword: pulumi.Output<string>, connectionString: pulumi.Output<string>) {
    const deliveryKey = new random.RandomPassword("UmbracoDeliveryKey", {
            length: 24,
            special: true,
            overrideSpecial: "_%@",
        });
        
    
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
            value: sqlPassword,
        },
        {
            name: "UmbracoSqlConnectionString",
            value: connectionString,
        },
        {
            name: "UmbracoDeliveryKey",
            value: deliveryKey.result,
        },
        {
            name: "CMSHOST",
            value: "https://umbraco.kjeldsen.dev",
        },
    ];

    for (const secret of keyVaultSecrets) {
        new azureNative.keyvault.Secret(secret.name, {
            secretName: secret.name,
            properties: { value: secret.value },
            vaultName: keyVault.name,
            resourceGroupName,
        });
    }
}

