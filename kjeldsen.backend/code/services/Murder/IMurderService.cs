using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace kjeldsen.backend.code.services;

public interface IMurderService
{
    Task RecordMurderAsync(string username, string? providedKey);
    Task<IEnumerable<MurderRecord>> GetAllMurdersAsync();

    Task ClearAllMurdersAsync();
}

public class MurderRecord
{
    public int Id { get; set; }
    public string Username { get; set; }
    public DateTime Created { get; set; }
}
