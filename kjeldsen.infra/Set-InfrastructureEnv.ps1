# Read key-value pairs from .env.infra and export as ARM_* variables for Pulumi
Get-Content ".env.infra" | ForEach-Object {
    if ($_ -match "^(.*?)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        switch ($key) {
            "INFRA__APPID"      { $env:ARM_CLIENT_ID = $value }
            "INFRA__SECRET"     { $env:ARM_CLIENT_SECRET = $value }
            "INFRA__TENTANTID"  { $env:ARM_TENANT_ID = $value }
            "INFRA__SUBID"      { $env:ARM_SUBSCRIPTION_ID = $value }
        }
    }
}
Write-Host "Environment variables for Pulumi set."
