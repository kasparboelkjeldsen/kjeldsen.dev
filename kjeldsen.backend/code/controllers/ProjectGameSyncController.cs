using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using uSync.BackOffice;
using uSync.BackOffice.SyncHandlers.Models;

namespace kjeldsen.backend.code.controllers;

/// <summary>
/// Temporary: lets The Project Game (the theprojectgame repository, tpg.kjeldsen.dev) re-seed its
/// own content after a deploy without anyone opening the backoffice. Remove after the party.
///
/// POST /api/tpg/import with the Delivery API key in the Api-Key header runs a uSync import of
/// uSync/tpg/ and nothing else. That folder holds only the game's data type, its two document
/// types and its content nodes, so the worst this endpoint can do is put the game's content back
/// to what is in this repository. The site's own export in uSync/v18 is never read.
///
/// The key check is the Delivery API key rather than an obscure URL because this repository is
/// public: a secret path written here would not be secret.
/// </summary>
[ApiController]
[Route("api/tpg")]
public class ProjectGameSyncController : Controller
{
    private const string Folder = "uSync/tpg/";
    private static readonly SemaphoreSlim Running = new(1, 1);

    private readonly ISyncService _sync;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ProjectGameSyncController> _logger;

    public ProjectGameSyncController(ISyncService sync, IConfiguration configuration, ILogger<ProjectGameSyncController> logger)
    {
        _sync = sync;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("import")]
    public async Task<IActionResult> Import()
    {
        var expected = _configuration["Umbraco:CMS:DeliveryApi:ApiKey"];
        var given = Request.Headers["Api-Key"].ToString();
        if (string.IsNullOrEmpty(expected) || !SameKey(given, expected))
        {
            return Unauthorized(new { message = "Api-Key header missing or wrong." });
        }

        // One import at a time: a second caller is told so instead of queueing behind the first.
        if (!await Running.WaitAsync(0))
        {
            return Conflict(new { message = "An import is already running." });
        }

        try
        {
            var started = DateTime.UtcNow;
            var actions = (await _sync.StartupImportAsync(new[] { Folder }, false, new SyncHandlerOptions())).ToList();
            var changed = actions.Where(a => a.Change > uSync.Core.ChangeType.NoChange).ToList();
            var failed = actions.Where(a => !a.Success).ToList();

            _logger.LogInformation(
                "Project Game import from {Folder}: {Items} items, {Changes} changes, {Failures} failures",
                Folder, actions.Count, changed.Count, failed.Count);

            return Ok(new
            {
                folder = Folder,
                items = actions.Count,
                changes = changed.Count,
                failures = failed.Count,
                seconds = Math.Round((DateTime.UtcNow - started).TotalSeconds, 1),
                changed = changed.Take(60).Select(a => new { type = a.ItemType, name = a.Name, change = a.Change.ToString() }),
                failed = failed.Take(20).Select(a => new { type = a.ItemType, name = a.Name, message = a.Message }),
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Project Game import from {Folder} failed", Folder);
            return StatusCode(500, new { message = ex.Message });
        }
        finally
        {
            Running.Release();
        }
    }

    private static bool SameKey(string given, string expected) =>
        CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(given ?? string.Empty), Encoding.UTF8.GetBytes(expected));
}
