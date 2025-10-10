using kjeldsen.backend.code.engage.Options;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Infrastructure.BackgroundJobs;
using Umbraco.Engage.Data.Reporting.StarGeneration;
using Umbraco.Engage.Infrastructure.Analytics.Processing.ClientSideData;

namespace kjeldsen.backend.code.engage.RecurringJobs;

public class RecurringReporting : IRecurringBackgroundJob
{
    public TimeSpan Period { get; set; }

    public event EventHandler? PeriodChanged;

    private readonly IStarGenerationService _starGenerationService;
    private readonly IAnalyticsClientSideDataProcessor _analyticsClientSideDataProcessor;
    public RecurringReporting(IOptions<EngageExtensionsOptions> options, IStarGenerationService starGenerationService, IAnalyticsClientSideDataProcessor analyticsClientSideDataProcessor) 
    {
        var settings = options.Value;
        if (settings.ProcessingInterval > 0)
            Period = TimeSpan.FromMinutes(settings.ProcessingInterval);

        _starGenerationService = starGenerationService;
        _analyticsClientSideDataProcessor = analyticsClientSideDataProcessor;
    }
    public async Task RunJobAsync()
    {
        if(!_starGenerationService.IsGenerationCurrentlyRunning())
        {
            _starGenerationService.Generate();
            _analyticsClientSideDataProcessor.Process();
        }
    }
}

public class RecurringReportingComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddRecurringBackgroundJob<RecurringReporting>();
    }
}