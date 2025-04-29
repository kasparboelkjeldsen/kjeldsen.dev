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
    private readonly IContentService _contentService;

    public CacheKeyDependencyResolver(
        IRelationService relationService, IContentService contentService)
    {
        _pickerResolver = new PickerDependencyResolver();
        _relationResolver = new RelationDependencyResolver(relationService, contentService);
        _blockResolver = new BlockDependencyResolver(); // Pass self for recursion
        _contentService = contentService;
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

        if (content.HasProperty("childKeys"))
        {
            var includeChildren = content.GetValue<bool>("childKeys");

            if (includeChildren)
            {
                var children = _contentService.GetPagedChildren(content.Id, 0, 100, out long _);
                foreach (var child in children)
                {
                    dependencies.UnionWith(GetDependencies(child, visited));
                }
            }

        }

        return dependencies;
    }
}

