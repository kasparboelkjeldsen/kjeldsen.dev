using System.Security.Cryptography;
using System.Text;

namespace kjeldsen.backend.code.visio;

/// <summary>
/// The editor's side of a chart, read off the block. Its hash is stored with the output so a save
/// that changes nothing the model would see - a caption, the block moved in the grid - does not
/// pay for a new one.
/// </summary>
public sealed record DataVisioRequest(
    Guid BlockKey,
    string Dataset,
    string Prompt,
    string ChartType,
    string Profile)
{
    public const string AutoChartType = "Auto";

    /// <summary>Short, stable fingerprint of everything the model is shown.</summary>
    public string Hash
    {
        get
        {
            var text = string.Join('\u001f', Dataset, Prompt, ChartType, Profile);
            return Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(text)))[..16];
        }
    }
}
