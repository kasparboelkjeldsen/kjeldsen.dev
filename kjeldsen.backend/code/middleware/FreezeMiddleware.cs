namespace kjeldsen.backend.code.middleware;

public class FreezeMiddleware
{
    private readonly RequestDelegate _next;
    private static bool _isFreezing = false;
    private static readonly object _lock = new();

    public FreezeMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (_isFreezing)
        {
            // Global freeze: stall ALL requests
            Thread.Sleep(30000); // Block the thread for 1 minute
        }

        await _next(context);
    }

    public static void TriggerFreeze()
    {
        lock (_lock)
        {
            if (!_isFreezing)
            {
                _isFreezing = true;
                _ = Task.Run(async () =>
                {
                    await Task.Delay(30000); // 30 sec

                    _isFreezing = false;
                });
            }
        }
    }
}
