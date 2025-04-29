using kjeldsen.backend.code.services.CacheDependencySolver.Resolvers;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;

namespace kjeldsen.backend.code.services.CacheDependencySolver;

public class CacheKeyDependencyResolver : ICacheKeyDependencyResolver
{
    private readonly PickerDependencyResolver _pickerResolver;
    private readonly BlockDependencyResolver _blockResolver;
    private readonly RelationDependencyResolver _relationResolver;

    public CacheKeyDependencyResolver(
        IRelationService relationService, IContentService contentService)
    {
        _pickerResolver = new PickerDependencyResolver();
        _relationResolver = new RelationDependencyResolver(relationService, contentService);
        _blockResolver = new BlockDependencyResolver(); // Pass self for recursion
    }

    public IEnumerable<string> GetDependencies(IContent content, ISet<Guid> visited = null)
    {
        var dependencies = new HashSet<string>
        {
            $"content-{content.Key}"
        };

        dependencies.UnionWith(_pickerResolver.GetPickerDependencies(content));
        dependencies.UnionWith(_blockResolver.GetBlockDependencies(content));
        dependencies.UnionWith(_relationResolver.GetRelationDependencies(content));

        return dependencies;
    }
}

