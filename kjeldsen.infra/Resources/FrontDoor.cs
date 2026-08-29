using Pulumi;
using AzureNative = Pulumi.AzureNative;

namespace Kjeldsen.Infra;

/// <summary>
/// Azure Front Door, in full.
///
/// Previously only the profile was managed as code and everything below it was created by hand
/// in the portal: endpoint, origin groups, origins, routes, custom domains, the cacheRules rule
/// set and the WAF security policy. All of it is now here.
/// </summary>
public static class FrontDoor
{
    public static void Create()
    {
    var kjdev_fd = new AzureNative.Cdn.Profile("kjdev-fd", new()
    {
        Location = "Global",
        OriginResponseTimeoutSeconds = 60,
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
        Sku = new AzureNative.Cdn.Inputs.SkuArgs
        {
            Name = AzureNative.Cdn.SkuName.Standard_AzureFrontDoor,
        },
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var kjeldsen_dev_endpoint = new AzureNative.Cdn.AFDEndpoint("kjeldsen-dev-endpoint", new()
    {
        EnabledState = AzureNative.Cdn.EnabledState.Enabled,
        EndpointName = "kjeldsen-dev",
        Location = "Global",
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var og_content = new AzureNative.Cdn.AFDOriginGroup("og-content", new()
    {
        HealthProbeSettings = new AzureNative.Cdn.Inputs.HealthProbeParametersArgs
        {
            ProbeIntervalInSeconds = 100,
            ProbePath = "/",
            ProbeProtocol = AzureNative.Cdn.ProbeProtocol.Https,
            ProbeRequestType = AzureNative.Cdn.HealthProbeRequestType.HEAD,
        },
        LoadBalancingSettings = new AzureNative.Cdn.Inputs.LoadBalancingSettingsParametersArgs
        {
            AdditionalLatencyInMilliseconds = 50,
            SampleSize = 4,
            SuccessfulSamplesRequired = 3,
        },
        OriginGroupName = "content",
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
        SessionAffinityState = AzureNative.Cdn.EnabledState.Disabled,
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var og_umbraco = new AzureNative.Cdn.AFDOriginGroup("og-umbraco", new()
    {
        HealthProbeSettings = new AzureNative.Cdn.Inputs.HealthProbeParametersArgs
        {
            ProbeIntervalInSeconds = 100,
            ProbePath = "/",
            ProbeProtocol = AzureNative.Cdn.ProbeProtocol.Http,
            ProbeRequestType = AzureNative.Cdn.HealthProbeRequestType.HEAD,
        },
        LoadBalancingSettings = new AzureNative.Cdn.Inputs.LoadBalancingSettingsParametersArgs
        {
            AdditionalLatencyInMilliseconds = 50,
            SampleSize = 4,
            SuccessfulSamplesRequired = 3,
        },
        OriginGroupName = "umbraco",
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
        SessionAffinityState = AzureNative.Cdn.EnabledState.Disabled,
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var origin_content = new AzureNative.Cdn.AFDOrigin("origin-content", new()
    {
        EnabledState = AzureNative.Cdn.EnabledState.Enabled,
        EnforceCertificateNameCheck = true,
        HostName = "kjdev-app-frontend.azurewebsites.net",
        HttpPort = 80,
        HttpsPort = 443,
        OriginGroupName = "content",
        OriginHostHeader = "kjdev-app-frontend.azurewebsites.net",
        OriginName = "content",
        Priority = 2,
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
        Weight = 1000,
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var origin_umbraco = new AzureNative.Cdn.AFDOrigin("origin-umbraco", new()
    {
        EnabledState = AzureNative.Cdn.EnabledState.Enabled,
        EnforceCertificateNameCheck = true,
        HostName = "kjdev-app-backend-eqhhguczfrh6gndg.westeurope-01.azurewebsites.net",
        HttpPort = 80,
        HttpsPort = 443,
        OriginGroupName = "umbraco",
        OriginHostHeader = "umbraco.kjeldsen.dev",
        OriginName = "umbraco-kjeldsen-dev",
        Priority = 1,
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
        Weight = 1000,
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var route_content = new AzureNative.Cdn.Route("route-content", new()
    {
        CacheConfiguration = new AzureNative.Cdn.Inputs.AfdRouteCacheConfigurationArgs
        {
            CompressionSettings = new AzureNative.Cdn.Inputs.CompressionSettingsArgs
            {
                IsCompressionEnabled = false,
            },
            QueryStringCachingBehavior = AzureNative.Cdn.AfdQueryStringCachingBehavior.UseQueryString,
        },
        CustomDomains = new[]
        {
            new AzureNative.Cdn.Inputs.ActivatedResourceReferenceArgs
            {
                Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourcegroups/kjdev-rg/providers/Microsoft.Cdn/profiles/kjdev-fd/customdomains/www-kjeldsen-dev-8c07",
            },
            new AzureNative.Cdn.Inputs.ActivatedResourceReferenceArgs
            {
                Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourcegroups/kjdev-rg/providers/Microsoft.Cdn/profiles/kjdev-fd/customdomains/kjeldsen-dev-a132",
            },
        },
        EnabledState = AzureNative.Cdn.EnabledState.Enabled,
        EndpointName = "kjeldsen-dev",
        ForwardingProtocol = AzureNative.Cdn.ForwardingProtocol.MatchRequest,
        HttpsRedirect = AzureNative.Cdn.HttpsRedirect.Enabled,
        LinkToDefaultDomain = AzureNative.Cdn.LinkToDefaultDomain.Disabled,
        OriginGroup = new AzureNative.Cdn.Inputs.ResourceReferenceArgs
        {
            Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourcegroups/kjdev-rg/providers/Microsoft.Cdn/profiles/kjdev-fd/origingroups/content",
        },
        PatternsToMatch = new[]
        {
            "/*",
        },
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
        RouteName = "content",
        RuleSets = new[]
        {
            new AzureNative.Cdn.Inputs.ResourceReferenceArgs
            {
                Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourcegroups/kjdev-rg/providers/Microsoft.Cdn/profiles/kjdev-fd/rulesets/cacheRules",
            },
        },
        SupportedProtocols = 
        {
            AzureNative.Cdn.AFDEndpointProtocols.Http,
            AzureNative.Cdn.AFDEndpointProtocols.Https,
        },
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var route_umbraco = new AzureNative.Cdn.Route("route-umbraco", new()
    {
        CustomDomains = new[]
        {
            new AzureNative.Cdn.Inputs.ActivatedResourceReferenceArgs
            {
                Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourcegroups/kjdev-rg/providers/Microsoft.Cdn/profiles/kjdev-fd/customdomains/umbraco-kjeldsen-dev-62c0",
            },
        },
        EnabledState = AzureNative.Cdn.EnabledState.Enabled,
        EndpointName = "kjeldsen-dev",
        ForwardingProtocol = AzureNative.Cdn.ForwardingProtocol.MatchRequest,
        HttpsRedirect = AzureNative.Cdn.HttpsRedirect.Enabled,
        LinkToDefaultDomain = AzureNative.Cdn.LinkToDefaultDomain.Disabled,
        OriginGroup = new AzureNative.Cdn.Inputs.ResourceReferenceArgs
        {
            Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourcegroups/kjdev-rg/providers/Microsoft.Cdn/profiles/kjdev-fd/origingroups/umbraco",
        },
        PatternsToMatch = new[]
        {
            "/*",
        },
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
        RouteName = "umbraco",
        SupportedProtocols = 
        {
            AzureNative.Cdn.AFDEndpointProtocols.Http,
            AzureNative.Cdn.AFDEndpointProtocols.Https,
        },
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var domain_apex = new AzureNative.Cdn.AFDCustomDomain("domain-apex", new()
    {
        AzureDnsZone = new AzureNative.Cdn.Inputs.ResourceReferenceArgs
        {
            Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourceGroups/kjdev-rg/providers/Microsoft.Network/dnszones/kjeldsen.dev",
        },
        CustomDomainName = "kjeldsen-dev-a132",
        HostName = "kjeldsen.dev",
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
        TlsSettings = new AzureNative.Cdn.Inputs.AFDDomainHttpsParametersArgs
        {
            CertificateType = AzureNative.Cdn.AfdCertificateType.ManagedCertificate,
            CipherSuiteSetType = AzureNative.Cdn.AfdCipherSuiteSetType.TLS12_2023,
            MinimumTlsVersion = AzureNative.Cdn.AfdMinimumTlsVersion.TLS12,
            Secret = new AzureNative.Cdn.Inputs.ResourceReferenceArgs
            {
                Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourceGroups/kjdev-rg/providers/Microsoft.Cdn/Profiles/kjdev-fd/secrets/0--fd999045-f66a-4609-9384-8199beaa2c3e-kjeldsen-dev",
            },
        },
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var domain_www = new AzureNative.Cdn.AFDCustomDomain("domain-www", new()
    {
        CustomDomainName = "www-kjeldsen-dev-8c07",
        HostName = "www.kjeldsen.dev",
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
        TlsSettings = new AzureNative.Cdn.Inputs.AFDDomainHttpsParametersArgs
        {
            CertificateType = AzureNative.Cdn.AfdCertificateType.ManagedCertificate,
            CipherSuiteSetType = AzureNative.Cdn.AfdCipherSuiteSetType.TLS12_2023,
            MinimumTlsVersion = AzureNative.Cdn.AfdMinimumTlsVersion.TLS12,
            Secret = new AzureNative.Cdn.Inputs.ResourceReferenceArgs
            {
                Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourceGroups/kjdev-rg/providers/Microsoft.Cdn/Profiles/kjdev-fd/secrets/0--e7e35375-b706-4321-b2eb-6748c97c120f-www-kjeldsen-dev",
            },
        },
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var domain_umbraco = new AzureNative.Cdn.AFDCustomDomain("domain-umbraco", new()
    {
        CustomDomainName = "umbraco-kjeldsen-dev-62c0",
        HostName = "umbraco.kjeldsen.dev",
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
        TlsSettings = new AzureNative.Cdn.Inputs.AFDDomainHttpsParametersArgs
        {
            CertificateType = AzureNative.Cdn.AfdCertificateType.ManagedCertificate,
            CipherSuiteSetType = AzureNative.Cdn.AfdCipherSuiteSetType.TLS12_2023,
            MinimumTlsVersion = AzureNative.Cdn.AfdMinimumTlsVersion.TLS12,
            Secret = new AzureNative.Cdn.Inputs.ResourceReferenceArgs
            {
                Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourceGroups/kjdev-rg/providers/Microsoft.Cdn/Profiles/kjdev-fd/secrets/0--4f680c38-c212-4211-ad7f-78b45a170fb0-umbraco-kjeldsen-dev",
            },
        },
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var ruleset_cache = new AzureNative.Cdn.RuleSet("ruleset-cache", new()
    {
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
        RuleSetName = "cacheRules",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var rule_no_content_cache = new AzureNative.Cdn.Rule("rule-no-content-cache", new()
    {
        Actions = new object[]
        {
            new AzureNative.Cdn.Inputs.DeliveryRuleRouteConfigurationOverrideActionArgs
            {
                Name = "RouteConfigurationOverride",
                Parameters = new AzureNative.Cdn.Inputs.RouteConfigurationOverrideActionParametersArgs
                {
                    TypeName = "DeliveryRuleRouteConfigurationOverrideActionParameters",
                },
            },
        },
        Conditions = new object[]
        {
            new AzureNative.Cdn.Inputs.DeliveryRuleUrlPathConditionArgs
            {
                Name = "UrlPath",
                Parameters = new AzureNative.Cdn.Inputs.UrlPathMatchConditionParametersArgs
                {
                    MatchValues = 
                    {
                        "/api/media",
                    },
                    NegateCondition = true,
                    Operator = AzureNative.Cdn.UrlPathOperator.Contains,
                    TypeName = "DeliveryRuleUrlPathMatchConditionParameters",
                },
            },
        },
        MatchProcessingBehavior = AzureNative.Cdn.MatchProcessingBehavior.Continue,
        Order = 100,
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
        RuleName = "noContentCache",
        RuleSetName = "cacheRules",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var security_policy = new AzureNative.Cdn.SecurityPolicy("security-policy", new()
    {
        Parameters = new AzureNative.Cdn.Inputs.SecurityPolicyWebApplicationFirewallParametersArgs
        {
            Associations = new[]
            {
                new AzureNative.Cdn.Inputs.SecurityPolicyWebApplicationFirewallAssociationArgs
                {
                    Domains = new[]
                    {
                        new AzureNative.Cdn.Inputs.ActivatedResourceReferenceArgs
                        {
                            Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourcegroups/kjdev-rg/providers/Microsoft.Cdn/profiles/kjdev-fd/customdomains/kjeldsen-dev-a132",
                        },
                        new AzureNative.Cdn.Inputs.ActivatedResourceReferenceArgs
                        {
                            Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourcegroups/kjdev-rg/providers/Microsoft.Cdn/profiles/kjdev-fd/customdomains/umbraco-kjeldsen-dev-62c0",
                        },
                    },
                    PatternsToMatch = new[]
                    {
                        "/*",
                    },
                },
            },
            Type = "WebApplicationFirewall",
            WafPolicy = new AzureNative.Cdn.Inputs.ResourceReferenceArgs
            {
                Id = "/subscriptions/e544652d-b079-448d-b112-5e46db72c8f7/resourceGroups/kjdev-rg/providers/Microsoft.Network/frontdoorWebApplicationFirewallPolicies/block",
            },
        },
        ProfileName = "kjdev-fd",
        ResourceGroupName = "kjdev-rg",
        SecurityPolicyName = "BlockWeirdTraffic",
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    var waf_block = new AzureNative.FrontDoor.Policy("waf-block", new()
    {
        CustomRules = new AzureNative.FrontDoor.Inputs.CustomRuleListArgs
        {
            Rules = new[]
            {
                new AzureNative.FrontDoor.Inputs.CustomRuleArgs
                {
                    Action = AzureNative.FrontDoor.ActionType.Block,
                    EnabledState = AzureNative.FrontDoor.CustomRuleEnabledState.Enabled,
                    MatchConditions = new[]
                    {
                        new AzureNative.FrontDoor.Inputs.MatchConditionArgs
                        {
                            MatchValue = new[]
                            {
                                "0",
                            },
                            MatchVariable = AzureNative.FrontDoor.MatchVariable.RequestHeader,
                            NegateCondition = false,
                            Operator = AzureNative.FrontDoor.Operator.LessThanOrEqual,
                            Selector = "User-Agent",
                        },
                    },
                    Name = "blockemptyuseragent",
                    Priority = 1,
                    RateLimitDurationInMinutes = 1,
                    RateLimitThreshold = 100,
                    RuleType = AzureNative.FrontDoor.RuleType.MatchRule,
                },
                new AzureNative.FrontDoor.Inputs.CustomRuleArgs
                {
                    Action = AzureNative.FrontDoor.ActionType.Block,
                    EnabledState = AzureNative.FrontDoor.CustomRuleEnabledState.Enabled,
                    MatchConditions = new[]
                    {
                        new AzureNative.FrontDoor.Inputs.MatchConditionArgs
                        {
                            MatchValue = new[]
                            {
                                ".php",
                            },
                            MatchVariable = AzureNative.FrontDoor.MatchVariable.RequestUri,
                            NegateCondition = false,
                            Operator = AzureNative.FrontDoor.Operator.Contains,
                        },
                        new AzureNative.FrontDoor.Inputs.MatchConditionArgs
                        {
                            MatchValue = new[]
                            {
                                "/wp-",
                            },
                            MatchVariable = AzureNative.FrontDoor.MatchVariable.RequestUri,
                            NegateCondition = false,
                            Operator = AzureNative.FrontDoor.Operator.Contains,
                        },
                    },
                    Name = "php",
                    Priority = 100,
                    RateLimitDurationInMinutes = 1,
                    RateLimitThreshold = 0,
                    RuleType = AzureNative.FrontDoor.RuleType.MatchRule,
                },
            },
        },
        Location = "Global",
        PolicyName = "block",
        PolicySettings = new AzureNative.FrontDoor.Inputs.PolicySettingsArgs
        {
            EnabledState = AzureNative.FrontDoor.PolicyEnabledState.Enabled,
            Mode = AzureNative.FrontDoor.PolicyMode.Detection,
            RequestBodyCheck = AzureNative.FrontDoor.PolicyRequestBodyCheck.Enabled,
        },
        ResourceGroupName = "kjdev-rg",
        Sku = new AzureNative.FrontDoor.Inputs.SkuArgs
        {
            Name = AzureNative.FrontDoor.SkuName.Standard_AzureFrontDoor,
        },
    }, new CustomResourceOptions
    {
        Protect = true,
    });

    }
}
