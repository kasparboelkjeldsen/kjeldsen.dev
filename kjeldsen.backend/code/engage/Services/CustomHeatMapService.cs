using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Services;
using Umbraco.Engage.Data.Common.NPoco;
using Umbraco.Engage.Infrastructure.Heatmaps;

namespace kjeldsen.backend.code.engage.Services;

public class CustomHeatMapService : IHeatmapService
{
    private readonly IDatabaseContextProvider _databaseContextProvider;
    private readonly IIdKeyMap _idKeyMap;
    private HeatmapService heatmapService;
    public CustomHeatMapService(IDatabaseContextProvider databaseContextProvider, IIdKeyMap idKeyMap)
    {
        _databaseContextProvider = databaseContextProvider;
        _idKeyMap = idKeyMap;

        heatmapService = new HeatmapService(_databaseContextProvider, _idKeyMap);
    }
    public Heatmap GenerateHeatmap(HeatmapSettings settings)
    {
        if(settings.Culture != null)
            settings.Culture = settings.Culture.Equals("invariant", StringComparison.OrdinalIgnoreCase) ? "en-US" : settings.Culture;

        if (settings.To.HasValue)
        {
            settings.To = new DateTime(settings.To.Value.Year, settings.To.Value.Month, settings.To.Value.Day, 23, 59, 59);
        }

        var result = heatmapService.GenerateHeatmap(settings);


        return result;
    }
}

public class CustomHeatMapServiceComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // Remove the default registration so our custom one takes precedence.
        
        var descriptor = builder.Services.FirstOrDefault(s => s.ServiceType == typeof(IHeatmapService));
        if (descriptor != null)
        {
            builder.Services.Remove(descriptor);
        }
        builder.Services.AddTransient<IHeatmapService, CustomHeatMapService>();
        
    }
}