using Pulumi;
using Kjeldsen.Infra;

// kjeldsen.dev infrastructure.
//
// This stack was adopted from resources that already existed in Azure, via `pulumi import` rather
// than by recreating anything. Two consequences run through the whole program: every resource
// carries an explicit Azure name, and the target state is for `pulumi preview` to report no
// changes at all. A clean preview is what proves the code matches what is deployed.
//
// State is a local file backend, deliberately outside this repository - the repo is public and
// Pulumi state carries resource outputs, including secrets. See README.md.
return await Deployment.RunAsync(() =>
{
    var resourceGroup = Core.Create();

    Data.Create(resourceGroup);

    var (frontendApp, backendApp) = Compute.Create(resourceGroup);

    // The DNS dependencies point both ways, so the zone is created before Front Door (whose custom
    // domains reference it) and the records afterwards (the apex is an alias to the endpoint).
    var dnsZone = Dns.CreateZone(resourceGroup);
    var frontDoorEndpoint = FrontDoor.Create(resourceGroup, dnsZone, frontendApp, backendApp);
    Dns.CreateRecords(resourceGroup, dnsZone, frontDoorEndpoint);

    return new Dictionary<string, object?>
    {
        ["resourceGroupName"] = resourceGroup.Name,
        ["frontDoorEndpointHostName"] = frontDoorEndpoint.HostName,
        // Consumed by the backend to purge the Front Door cache; also held in Key Vault as
        // FrontDoorEndpointResourceId, which used to be a hand-copied string.
        ["frontDoorEndpointResourceId"] = frontDoorEndpoint.Id,
        ["frontendAppHostName"] = frontendApp.DefaultHostName,
        ["backendAppHostName"] = backendApp.DefaultHostName,
    };
});
