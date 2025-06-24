// vars.ts

export enum ResourceType {
    ResourceGroup = "rg",
    StorageAccount = "storage",
    BlobContainer = "blob",
    AppService = "app",
    RedisCache = "redis",
    FrontDoor = "fd",
    KeyVault = "kv",
    SqlServer = "sql",
    SqlDb = "sqldb",
    AppServicePlan = "asp",
    DnsZone = "dns",
}

export class ResourceVars {
    private readonly prefix: string;

    constructor(projectPrefix: string) {
        this.prefix = projectPrefix.toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    /**
     * Dashed resource name, e.g. "kd-sql-umbraco"
     */
    name(type: ResourceType, postfix?: string): string {
        const parts = [this.prefix, type, postfix].filter(Boolean);
        return parts.join("-").toLowerCase();
    }

    /**
     * Compact name, e.g. "kdsqldbumbraco"
     */
    compact(type: ResourceType, postfix?: string): string {
        const parts = [this.prefix, type, postfix].filter(Boolean);
        return parts.join("").toLowerCase();
    }
}
