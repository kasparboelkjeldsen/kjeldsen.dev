namespace kjeldsen.backend.code.engage.Models;

public class ClientCollectDto
{
    public string? PageViewGuid { get; set; }
    public TimeOnPage? TimeOnPage { get; set; }
    public ScrollDepth? ScrollDepth { get; set; }
    public List<object>? Links { get; set; } // todo
    public List<object>? Events { get; set; } // todo
    public List<object>? Videos { get; set; } // todo
    public List<object>? UmbracoForms { get; set; }
    public string? Version { get; set; }
    public string? ExternalVisitorId { get; set; }
    public DateTime? ServerReceivedAt { get; set; }
}

public class ScrollDepth
{
    public int Pixels { get; set; }
    public int Percentage { get; set; }
}

public class TimeOnPage
{
    public int TotalTimeMillis { get; set; }
    public int EngagedTimeMillis { get; set; }
}