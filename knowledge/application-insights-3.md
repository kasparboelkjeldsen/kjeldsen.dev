# Application Insights 3

The 2026-11-09 update sweep took `Microsoft.ApplicationInsights(.AspNetCore)` from 2.23 to 3.2.
Version 3 is a rewrite on OpenTelemetry: `AddApplicationInsightsTelemetry()` and `TelemetryClient`
are still there, but telemetry processors and initialisers are gone. Three things broke, and only
the first one at compile time.

**`ITelemetryProcessor` no longer exists.** The filter that keeps 404s and 499s out of the request
telemetry is now `RequestFilterProcessor`, an OpenTelemetry span processor
(`code/extensions/ApplicationInsightsExtension.cs`). It drops a span by clearing its Recorded flag
in `OnEnd`, which only works if it runs before the exporter, so it is registered before
`AddApplicationInsightsTelemetry()`. Processors run in the order they were added.

**The Serilog sink's connection-string overload throws at startup.** `Serilog.Sinks.ApplicationInsights`
5.0.1 is the latest release and still declares `Microsoft.ApplicationInsights < 3.0`. Given a
connection string, it sets it on the shared default `TelemetryConfiguration`, which version 3 locks
once it is built: `Configuration cannot be modified after it has been built`. A console test with
the two packages alone passed, because nothing had built the default configuration yet; only the
real app showed it. The Serilog section now calls `AzureApplicationInsights`
(`code/extensions/ApplicationInsightsSinkExtensions.cs`), which gives the sink a new
`TelemetryConfiguration` of its own, the way the error message asks.

**Logs belonging to a dropped span are dropped with it.** Once the 404 request span was filtered
out, the `404 - url` warning written inside that request disappeared from App Insights as well.
Logs written outside a request still arrived, so nothing looked broken. Production sends about 500
of these warnings a day, and they are the only record of a 404 that is kept. The processor now
writes the warning with `Activity.Current` cleared, and both halves were checked in App Insights:
the warning arrives as a trace, and there is no request row for it.

To check after a change: request a missing URL on the backend, then query App Insights
(`az rest` against `api.applicationinsights.io` with the `kjdev-appinsights-umbraco` app id) for a
trace that `has` the URL and a request whose `url has` it. The first should be there, the second
not. Ingestion takes a minute or two.
