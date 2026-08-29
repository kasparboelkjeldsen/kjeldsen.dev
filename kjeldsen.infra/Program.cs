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
// Pulumi state carries resource outputs, including secrets.
return await Deployment.RunAsync(() =>
{
    Core.Create();
    Data.Create();
    Compute.Create();
    Dns.Create();
    FrontDoor.Create();
});
