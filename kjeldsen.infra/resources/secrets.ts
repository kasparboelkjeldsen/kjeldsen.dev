import * as azureNative from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export function createKeyVaultSecrets(keyVault: azureNative.keyvault.Vault, resourceGroupName: pulumi.Input<string>, storageAccount: azureNative.storage.StorageAccount, sqlPassword: pulumi.Output<string>, connectionString: pulumi.Output<string>) {
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
