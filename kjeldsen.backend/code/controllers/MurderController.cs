using kjeldsen.backend.code.middleware;
using kjeldsen.backend.code.services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace kjeldsen.backend.code.controllers;

[ApiController]
[Route("api/murder")]
public class MurderController : Controller
{
    private readonly IMurderService _murderService;

    public MurderController(IMurderService murderService)
    {
        _murderService = murderService;
    }

    /// <summary>
    /// Records a murder (requires MurderKey header).
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> RecordMurder([FromBody] MurderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Username))
        {
            return BadRequest("Username is required.");
        }

        var murderKey = Request.Headers["MurderKey"].ToString();

        try
        {
            await _murderService.RecordMurderAsync(request.Username, murderKey);
            return Ok(new { message = "Murder recorded." });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Invalid MurderKey." });
        }
    }

    /// <summary>
    /// Retrieves all murders (no key required).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllMurders()
    {
        var murders = await _murderService.GetAllMurdersAsync();
        return Ok(murders);
    }

    public class MurderRequest
    {
        public string Username { get; set; } = string.Empty;
    }

    [HttpDelete]
    public async Task<IActionResult> Clear()
    {
        await _murderService.ClearAllMurdersAsync();
        return Ok();
    }
}
