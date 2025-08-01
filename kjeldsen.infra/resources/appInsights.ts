import * as azureNative from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";
import { ResourceVars } from "../vars";

export function createAppInsights(
  rsv: ResourceVars,
  resourceGroupName: pulumi.Input<string>,
  location: pulumi.Input<string>,
  tags: { [key: string]: string }
) {

  const workspace = new azureNative.operationalinsights.Workspace(`${rsv.prefix}-logs`, {
    resourceGroupName,
    location,
    sku: {
      name: "PerGB2018",
    },
    retentionInDays: 30,
    workspaceCapping: {
      dailyQuotaGb: 1,
    },
    tags,
    workspaceName: `${rsv.prefix}-logs`,
  });

  const appInsights = new azureNative.insights.Component(`${rsv.prefix}-appinsights`, {
    resourceGroupName,
    location,
    applicationType: "web",
    kind: "web",
    tags,
    resourceName: `${rsv.prefix}-appinsights`,
    workspaceResourceId: workspace.id,
  });

  return {
    appInsights,
    instrumentationKey: appInsights.instrumentationKey,
    connectionString: appInsights.connectionString,
  };
}
