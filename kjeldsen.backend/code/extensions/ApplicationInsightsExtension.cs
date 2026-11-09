using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Trace;
using Serilog;
using ILogger = Microsoft.Extensions.Logging.ILogger;

namespace kjeldsen.backend.code.extensions;

public static class ApplicationInsightsExtension
{
    public static WebApplicationBuilder AddApplicationInsights(this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetValue<string>("ApplicationInsights:ConnectionString");

        // Application Insights 3 runs on OpenTelemetry and has no telemetry processors. The filter is
        // a span processor instead, registered before AddApplicationInsightsTelemetry so it sees each
        // request span ahead of the exporter: processors run in the order they were added.
        builder.Services.ConfigureOpenTelemetryTracerProvider(tracing =>
            tracing.AddProcessor<RequestFilterProcessor>());

        builder.Services.AddApplicationInsightsTelemetry(options =>
        {
            options.ConnectionString = connectionString;
        });

        // Mutate the Serilog config section BEFORE Serilog spins up
        var serilogSection = builder.Configuration.GetSection("Serilog");
        var writeToSection = serilogSection.GetSection("WriteTo");

        foreach (var sink in writeToSection.GetChildren())
        {
            if (sink.GetValue<string>("Name") == "AzureApplicationInsights")
            {
                var args = sink.GetSection("Args");
                args["connectionString"] = connectionString;
            }
        }

        builder.Host.UseSerilog((context, services, configuration) =>
        {
            configuration
                .ReadFrom.Configuration(context.Configuration);
        });

        return builder;
    }
}

/// <summary>
/// Keeps 404s (logged as a warning instead) and 499s (client closed the connection) out of the
/// request telemetry. Clearing the Recorded flag is how a span is dropped after it has ended: the
/// exporter skips spans that are not recorded.
/// </summary>
public class RequestFilterProcessor(ILogger<RequestFilterProcessor> logger) : BaseProcessor<Activity>
{
    private readonly ILogger _logger = logger;

    public override void OnEnd(Activity activity)
    {
        if (activity.Kind != ActivityKind.Server)
        {
            return;
        }

        var statusCode = activity.GetTagItem("http.response.status_code") switch
        {
            int code => code,
            string text when int.TryParse(text, out var code) => code,
            _ => 0,
        };

        if (statusCode == StatusCodes.Status404NotFound)
        {
            // Written outside the request's trace: Application Insights drops the logs that belong
            // to a dropped span, and this warning is the only record of the 404 that is kept.
            var current = Activity.Current;
            Activity.Current = null;
            try
            {
                _logger.LogWarning("404 - url: {Url}", activity.GetTagItem("url.path"));
            }
            finally
            {
                Activity.Current = current;
            }

            activity.ActivityTraceFlags &= ~ActivityTraceFlags.Recorded;
        }
        else if (statusCode == 499)
        {
            activity.ActivityTraceFlags &= ~ActivityTraceFlags.Recorded;
        }
    }
}
