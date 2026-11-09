using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Extensibility;
using Serilog;
using Serilog.Configuration;
using Serilog.Events;
using Serilog.Sinks.ApplicationInsights.TelemetryConverters;

namespace kjeldsen.backend.code.extensions;

public static class ApplicationInsightsSinkExtensions
{
    /// <summary>
    /// The Serilog Application Insights sink, on a TelemetryConfiguration of its own. The sink's own
    /// connection-string overload sets the string on the shared default configuration, which
    /// Application Insights 3 locks once it is built, so startup threw. A new configuration is what
    /// Application Insights 3 asks for. Called by name from the Serilog section of appsettings.json.
    /// </summary>
    public static LoggerConfiguration AzureApplicationInsights(
        this LoggerSinkConfiguration sinkConfiguration,
        string connectionString,
        ITelemetryConverter telemetryConverter,
        LogEventLevel restrictedToMinimumLevel = LevelAlias.Minimum)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            // No connection string (Key Vault not read yet): write nowhere rather than fail.
            return sinkConfiguration.Logger(_ => { });
        }

        var configuration = new TelemetryConfiguration { ConnectionString = connectionString };
        return sinkConfiguration.ApplicationInsights(
            new TelemetryClient(configuration), telemetryConverter, restrictedToMinimumLevel);
    }
}
