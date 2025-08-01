using System.Net;
using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.ApplicationInsights.Extensibility;
using Serilog;
using ILogger = Microsoft.Extensions.Logging.ILogger;

namespace kjeldsen.backend.code.extensions;

public static class ApplicationInsightsExtension
{
    public static WebApplicationBuilder AddApplicationInsights(this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetValue<string>("ApplicationInsights:ConnectionString");

        builder.Services.AddApplicationInsightsTelemetry(options =>
        {
            options.ConnectionString = connectionString;
        }).AddApplicationInsightsTelemetryProcessor<CustomTelemetryProcessor>();

        // Mutate the Serilog config section BEFORE Serilog spins up
        var serilogSection = builder.Configuration.GetSection("Serilog");
        var writeToSection = serilogSection.GetSection("WriteTo");

        foreach (var sink in writeToSection.GetChildren())
        {
            if (sink.GetValue<string>("Name") == "ApplicationInsights")
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

public class CustomTelemetryProcessor : ITelemetryProcessor
{
    private ITelemetryProcessor Next { get; set; }
    private readonly ILogger _logger;

    public CustomTelemetryProcessor(ITelemetryProcessor next, ILogger<CustomTelemetryProcessor> logger)
    {
        _logger = logger;
        this.Next = next;
    }
    public void Process(ITelemetry item)
    {
        RequestTelemetry requestTelemetry = item as RequestTelemetry;

        // filter out 404 requests
        if (requestTelemetry != null && requestTelemetry.ResponseCode != null && int.Parse(requestTelemetry.ResponseCode) == (int)HttpStatusCode.NotFound)
        {
            _logger.LogWarning("404 - url: {0}", requestTelemetry.Url);
            return;
        }
        if (requestTelemetry != null && requestTelemetry.ResponseCode != null && int.Parse(requestTelemetry.ResponseCode) == 499) // client closed connection
        {
            return;
        }

        Next.Process(item);
    }
}