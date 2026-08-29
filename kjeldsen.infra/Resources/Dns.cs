using Pulumi;
using AzureNative = Pulumi.AzureNative;

namespace Kjeldsen.Infra;

/// <summary>
/// The kjeldsen.dev zone and its records.
///
/// The _dnsauth TXT records matter more than they look: Front Door's managed certificates
/// revalidate through them, so losing one eventually breaks TLS on that hostname.
/// </summary>
public static class Dns
{
    public static void Create()
    {
    var kjeldsen_dev_zone = new AzureNative.Dns.Zone("kjeldsen-dev-zone", new()
    {
        Location = "global",
        ResourceGroupName = "kjdev-rg",
        ZoneName = "kjeldsen.dev",
        ZoneType = AzureNative.Dns.ZoneType.Public,
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var dns_apex_a = new AzureNative.Dns.RecordSet("dns-apex-a", new()
    {
        RecordType = "A",
        RelativeRecordSetName = "@",
        ResourceGroupName = "kjdev-rg",
        TargetResource = new AzureNative.Dns.Inputs.SubResourceArgs
        {
            Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourceGroups/kjdev-rg/providers/Microsoft.Cdn/profiles/kjdev-fd/afdendpoints/kjeldsen-dev",
        },
        Ttl = 3600.0,
        ZoneName = "kjeldsen.dev",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var dns_dnsauth_txt = new AzureNative.Dns.RecordSet("dns-dnsauth-txt", new()
    {
        RecordType = "TXT",
        RelativeRecordSetName = "_dnsauth",
        ResourceGroupName = "kjdev-rg",
        Ttl = 3600.0,
        TxtRecords = new[]
        {
            new AzureNative.Dns.Inputs.TxtRecordArgs
            {
                Value = new[]
                {
                    "_skjw7gordw9l7vx96zgovm6ayu872zx",
                },
            },
        },
        ZoneName = "kjeldsen.dev",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var dns_dnsauth_www_txt = new AzureNative.Dns.RecordSet("dns-dnsauth-www-txt", new()
    {
        RecordType = "TXT",
        RelativeRecordSetName = "_dnsauth.www",
        ResourceGroupName = "kjdev-rg",
        Ttl = 3600.0,
        TxtRecords = new[]
        {
            new AzureNative.Dns.Inputs.TxtRecordArgs
            {
                Value = new[]
                {
                    "_z4xb7h7ei6hn64c08wgpgib6an2c319",
                },
            },
        },
        ZoneName = "kjeldsen.dev",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var dns_dnsauth_umbraco_txt = new AzureNative.Dns.RecordSet("dns-dnsauth-umbraco-txt", new()
    {
        RecordType = "TXT",
        RelativeRecordSetName = "_dnsauth.umbraco",
        ResourceGroupName = "kjdev-rg",
        Ttl = 3600.0,
        TxtRecords = new[]
        {
            new AzureNative.Dns.Inputs.TxtRecordArgs
            {
                Value = new[]
                {
                    "_u414hej8ajkif2gw08tnzapqeowx83q",
                },
            },
        },
        ZoneName = "kjeldsen.dev",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var dns_asuid_umbraco_txt = new AzureNative.Dns.RecordSet("dns-asuid-umbraco-txt", new()
    {
        RecordType = "TXT",
        RelativeRecordSetName = "asuid.umbraco",
        ResourceGroupName = "kjdev-rg",
        Ttl = 3600.0,
        TxtRecords = new[]
        {
            new AzureNative.Dns.Inputs.TxtRecordArgs
            {
                Value = new[]
                {
                    "BFA1B76815118420A6F5F74178088434C0BF88A8FBE88604CA3BA2D384F941ED",
                },
            },
        },
        ZoneName = "kjeldsen.dev",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var dns_www_cname = new AzureNative.Dns.RecordSet("dns-www-cname", new()
    {
        CnameRecord = new AzureNative.Dns.Inputs.CnameRecordArgs
        {
            Cname = "kjeldsen-dev-a6aecgcne4djbjcv.z03.azurefd.net.",
        },
        RecordType = "CNAME",
        RelativeRecordSetName = "www",
        ResourceGroupName = "kjdev-rg",
        Ttl = 3600.0,
        ZoneName = "kjeldsen.dev",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var dns_umbraco_cname = new AzureNative.Dns.RecordSet("dns-umbraco-cname", new()
    {
        CnameRecord = new AzureNative.Dns.Inputs.CnameRecordArgs
        {
            Cname = "kjdev-app-backend-eqhhguczfrh6gndg.westeurope-01.azurewebsites.net",
        },
        RecordType = "CNAME",
        RelativeRecordSetName = "umbraco",
        ResourceGroupName = "kjdev-rg",
        Ttl = 3600.0,
        ZoneName = "kjeldsen.dev",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var dns_cdnverify_cname = new AzureNative.Dns.RecordSet("dns-cdnverify-cname", new()
    {
        CnameRecord = new AzureNative.Dns.Inputs.CnameRecordArgs
        {
            Cname = "cdnverify.kjeldsen-dev.azureedge.net",
        },
        RecordType = "CNAME",
        RelativeRecordSetName = "cdnverify",
        ResourceGroupName = "kjdev-rg",
        Ttl = 3600.0,
        ZoneName = "kjeldsen.dev",
    }, new CustomResourceOptions
    {
        Protect = true,
    });
    }
}
