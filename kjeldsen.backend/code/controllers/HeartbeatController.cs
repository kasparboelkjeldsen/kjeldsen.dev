using kjeldsen.backend.code.middleware;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace kjeldsen.backend.code.controllers;

[ApiController]
public class HeartbeatController : ControllerBase
{
    private readonly string _murderKey;

    public HeartbeatController(IConfiguration configuration)
    {
        _murderKey = configuration.GetSection("Nuxt:MurderKey").Value
            ?? throw new InvalidOperationException("MurderKey not configured.");
    }

    [HttpGet]
    [Route("/api/heartbeat/beat")]
    public IActionResult Beat()
    {
        return Ok("OK");
    }

    [HttpGet]
    [Route("/api/heartbeat/heartattack")]
    public IActionResult HeartAttack()
    {
        var providedKey = Request.Headers["MurderKey"].ToString();

        if (string.IsNullOrWhiteSpace(providedKey) || providedKey != _murderKey)
        {
            return Unauthorized(new { message = "No MurderKey? No heart attack for you." });
        }

        FreezeMiddleware.TriggerFreeze();
        return Ok(new { message = "💔 Heart attack triggered." });
    }
}
