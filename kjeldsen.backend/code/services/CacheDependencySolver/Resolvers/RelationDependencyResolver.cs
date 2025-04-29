namespace kjeldsen.backend.code.services.CacheDependencySolver.Resolvers;

using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;

public class RelationDependencyResolver
{
    private readonly IRelationService _relationService;
    private readonly IContentService _contentService;
    public RelationDependencyResolver(IRelationService relationService, IContentService contentService)
    {
        _relationService = relationService;
        _contentService = contentService;
    }

    public IEnumerable<string> GetRelationDependencies(IContent content)
    {
        var relations = _relationService.GetByChildId(content.Id);

        foreach (var relation in relations)
        {
            var key = _contentService.GetById(relation.ParentId);
            if(key != null)
                yield return $"content-{key.Key}";
        }
    }
}
