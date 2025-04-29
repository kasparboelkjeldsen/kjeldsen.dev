using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace kjeldsen.backend.code.services.CacheDependencySolver;

public interface ICacheKeyDependencyResolver
{
    /// <summary>
    /// Resolves all cache keys that should be associated with the given content item.
    /// Includes direct and indirect dependencies.
    /// </summary>
    /// <param name="content">The published content item.</param>
    /// <returns>A collection of cache keys as strings.</returns>
    IEnumerable<string> GetDependencies(IContent content, ISet<Guid> visited = null);

}
