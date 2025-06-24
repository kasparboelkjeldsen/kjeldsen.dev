import * as azureNative from "@pulumi/azure-native";
import * as random from "@pulumi/random";
import * as pulumi from "@pulumi/pulumi";
import { ResourceType, ResourceVars } from "../vars";

export function createSql(rsv: ResourceVars, resourceGroupName: pulumi.Input<string>, location: pulumi.Input<string>, tags: Record<string, string>) {
    const sqlPassword = new random.RandomPassword("sql-password", {
        length: 24,
        special: true,
        overrideSpecial: "_%@",
    });

    const sqlServer = new azureNative.sql.Server(rsv.name(ResourceType.SqlServer), {
        serverName: rsv.name(ResourceType.SqlServer),
        resourceGroupName,
        location,
        administratorLogin: "sqladminuser",
        administratorLoginPassword: sqlPassword.result,
        version: "12.0",
        tags,
    });

    const sqlDatabase = new azureNative.sql.Database(rsv.name(ResourceType.SqlDb, "umbraco"), {
        databaseName: rsv.compact(ResourceType.SqlDb, "umbraco"),
        resourceGroupName,
        location,
        serverName: sqlServer.name,
        sku: { name: "Basic", tier: "Basic" },
        maxSizeBytes: 2147483648,
        tags,
    });

    const connectionString = pulumi.interpolate`Server=tcp:${sqlServer.name}.database.windows.net,1433;Initial Catalog=${sqlDatabase.name};Persist Security Info=False;User ID=sqladminuser;Password=${sqlPassword.result};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;`;

    return { sqlPassword, sqlServer, sqlDatabase, connectionString };
}
