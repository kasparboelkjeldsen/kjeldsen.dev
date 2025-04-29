using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Community.DeliveryApiExtensions.Configuration.Options;
using Umbraco.Community.DeliveryApiExtensions.Models;
using Umbraco.Community.DeliveryApiExtensions.Services;
using Umbraco.Community.DeliveryApiExtensions.Swagger;

public class CustomDeliveryApiContentTypesSchemaFilter : ISchemaFilter, IDocumentFilter
{
    private readonly IOptionsMonitor<TypedSwaggerOptions> _typedSwaggerOptions;
    private readonly IContentTypeInfoService _contentTypeInfoService;
    private readonly ISchemaIdSelector _schemaIdSelector;
    private readonly ILogger<CustomDeliveryApiContentTypesSchemaFilter> _logger;

    public CustomDeliveryApiContentTypesSchemaFilter(
        IOptionsMonitor<TypedSwaggerOptions> typedSwaggerOptions,
        IContentTypeInfoService contentTypeInfoService,
        ISchemaIdSelector schemaIdSelector,
        ILogger<CustomDeliveryApiContentTypesSchemaFilter> logger)
    {
        _typedSwaggerOptions = typedSwaggerOptions;
        _contentTypeInfoService = contentTypeInfoService;
        _schemaIdSelector = schemaIdSelector;
        _logger = logger;
    }

    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        var settings = _typedSwaggerOptions.CurrentValue.SettingsFactory();

        if (settings is { UseOneOf: false, UseAllOf: false } || !HasMarker(context))
        {
            return;
        }

        ApplyPolymorphicContentType<IApiContent>(context,
            _contentTypeInfoService.GetContentTypes().Where(c => !c.IsElement).DistinctBy(c => c.Alias),
            contentType => (
                $"{contentType.SchemaId}ContentResponseModel",
                new OpenApiSchema
                {
                    Type = "object",
                    AdditionalPropertiesAllowed = false,
                    AllOf =
                    {
                        new OpenApiSchema
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.Schema,
                                Id = GetTypeSchemaId<IApiContentResponse>(settings.UseOneOf),
                            },
                        },
                        new OpenApiSchema
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.Schema,
                                Id = $"{contentType.SchemaId}ContentModel",
                            },
                        },
                    },
                }
            ));

        ApplyPolymorphicContentType<IApiElement>(context,
            _contentTypeInfoService.GetContentTypes().Where(c => !c.IsElement).DistinctBy(c => c.Alias),
            contentType => (
                $"{contentType.SchemaId}ContentModel",
                new OpenApiSchema
                {
                    Type = "object",
                    AdditionalPropertiesAllowed = false,
                    AllOf =
                    {
                        new OpenApiSchema
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.Schema,
                                Id = GetTypeSchemaId<IApiContent>(settings.UseOneOf),
                            },
                        },
                    },
                    Properties = { ["properties"] = BuildPropertiesSchema(contentType, context) },
                }
            ));

        ApplyPolymorphicContentType(context,
            _contentTypeInfoService.GetContentTypes().Where(c => c.IsElement).DistinctBy(c => c.Alias),
            contentType => (
                $"{contentType.SchemaId}ElementModel",
                new OpenApiSchema
                {
                    Type = "object",
                    AdditionalPropertiesAllowed = false,
                    AllOf =
                    {
                        new OpenApiSchema
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.Schema,
                                Id = GetTypeSchemaId<IApiElement>(settings.UseOneOf),
                            },
                        },
                    },
                    Properties = { ["properties"] = BuildPropertiesSchema(contentType, context) },
                }
            ));

        RemoveMarker(swaggerDoc);
    }

    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        var settings = _typedSwaggerOptions.CurrentValue.SettingsFactory();

        if (settings is { UseOneOf: false, UseAllOf: false })
        {
            return;
        }

        if (typeof(IApiContentResponse) == context.Type)
        {
            ApplyPolymorphicContentTypeSchema<IApiContentResponse, IApiContent>(
                schema, context,
                _contentTypeInfoService.GetContentTypes().Where(c => !c.IsElement).DistinctBy(c => c.Alias),
                settings,
                contentType => $"{contentType.SchemaId}ContentResponseModel"
            );
            AddMarker(context);
            return;
        }

        if (typeof(IApiContent) == context.Type)
        {
            ApplyPolymorphicContentTypeSchema<IApiContent, IApiElement>(
                schema, context,
                _contentTypeInfoService.GetContentTypes().Where(c => !c.IsElement).DistinctBy(c => c.Alias),
                settings,
                contentType => $"{contentType.SchemaId}ContentModel"
            );
            AddMarker(context);
            return;
        }

        if (typeof(IApiElement) == context.Type)
        {
            ApplyPolymorphicContentTypeSchema<IApiElement>(
                schema, context,
                _contentTypeInfoService.GetContentTypes().Where(c => c.IsElement).DistinctBy(c => c.Alias),
                settings,
                contentType => $"{contentType.SchemaId}ElementModel"
            );
            AddMarker(context);
            return;
        }
    }

    private OpenApiSchema BuildPropertiesSchema(ContentTypeInfo contentType, DocumentFilterContext context)
    {
        ContentTypePropertyInfo info = new ContentTypePropertyInfo()
        {
            Alias = "cacheKeys",
            EditorAlias = "none",
            Type = typeof(string[]),
            Inherited = false
        };

        contentType.Properties.Add(info);
        var schema = context.SchemaRepository.AddDefinition(
            $"{contentType.SchemaId}PropertiesModel",
            new OpenApiSchema
            {
                Type = "object",
                AdditionalPropertiesAllowed = false,
                AllOf = contentType.CompositionSchemaIds.Select(c => new OpenApiSchema
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.Schema,
                        Id = $"{c}PropertiesModel"
                    }
                }).ToList(),
                Properties = contentType.Properties
                    .Where(p => !p.Inherited)
                    .ToDictionary(
                        p => p.Alias,
                        p =>
                        {
                            try
                            {
                                var propertySchema = context.SchemaGenerator.GenerateSchema(p.Type, context.SchemaRepository);
                                propertySchema.Nullable = true;
                                return propertySchema;
                            }
                            catch (Exception ex)
                            {
                                _logger.LogWarning(ex, "Failed to generate schema for property {PropertyAlias}", p.Alias);
                                return new OpenApiSchema(); // fallback: any
                            }
                        })
            });

        return schema;
    }
    private const string MarkerId = "__marker__";

    private static bool HasMarker(DocumentFilterContext context)
    {
        return context.SchemaRepository.Schemas.ContainsKey(MarkerId);
    }

    private static void AddMarker(SchemaFilterContext context)
    {
        context.SchemaRepository.Schemas.TryAdd(MarkerId, new OpenApiSchema());
    }

    private static void RemoveMarker(OpenApiDocument swaggerDoc)
    {
        swaggerDoc.Components.Schemas.Remove(MarkerId);
    }
    private static void ApplyPolymorphicContentType<TAncestor>(
    DocumentFilterContext context,
    IEnumerable<ContentTypeInfo> contentTypes,
    Func<ContentTypeInfo, (string SchemaId, OpenApiSchema Schema)> contentTypeSchemaMapper)
    {
        // Ensure ancestor schema is generated if not already
        _ = context.SchemaGenerator.GenerateSchema(typeof(TAncestor), context.SchemaRepository);

        ApplyPolymorphicContentType(context, contentTypes, contentTypeSchemaMapper);
    }

    private static void ApplyPolymorphicContentType(
        DocumentFilterContext context,
        IEnumerable<ContentTypeInfo> contentTypes,
        Func<ContentTypeInfo, (string SchemaId, OpenApiSchema Schema)> contentTypeSchemaMapper)
    {
        foreach (ContentTypeInfo contentType in contentTypes)
        {
            (string schemaId, OpenApiSchema openApiSchema) = contentTypeSchemaMapper(contentType);
            context.SchemaRepository.AddDefinition(schemaId, openApiSchema);
        }
    }
    private void ApplyPolymorphicContentTypeSchema<T, TAncestor>(
    OpenApiSchema schema,
    SchemaFilterContext context,
    IEnumerable<ContentTypeInfo> contentTypes,
    SwaggerGenerationSettings settings,
    Func<ContentTypeInfo, string> contentTypeSchemaIdMapper)
    {
        // Add base type schema
        schema.AllOf.Add(new OpenApiSchema
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.Schema,
                Id = GetTypeSchemaId<TAncestor>(settings.UseOneOf)
            }
        });

        ApplyPolymorphicContentTypeSchema<T>(schema, context, contentTypes, settings, contentTypeSchemaIdMapper);
    }

    private void ApplyPolymorphicContentTypeSchema<T>(
        OpenApiSchema schema,
        SchemaFilterContext context,
        IEnumerable<ContentTypeInfo> contentTypes,
        SwaggerGenerationSettings settings,
        Func<ContentTypeInfo, string> contentTypeSchemaIdMapper)
    {
        OpenApiSchema? originalSchema = null;

        if (settings.UseOneOf)
        {
            // Swashbuckle doesn't allow us to inline schema overrides
            // So we copy and replace it in the registry
            originalSchema = schema;
            schema = new OpenApiSchema(originalSchema);
            schema.Properties.Remove("properties");

            context.SchemaRepository.Schemas.TryAdd(GetTypeSchemaId<T>(true), schema);
            ClearSchema(originalSchema);
        }

        schema.Discriminator = new OpenApiDiscriminator
        {
            PropertyName = "contentType"
        };

        foreach (ContentTypeInfo contentType in contentTypes)
        {
            var contentTypeSchema = new OpenApiSchema
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.Schema,
                    Id = contentTypeSchemaIdMapper(contentType)
                }
            };

            schema.Discriminator.Mapping[contentType.Alias] = contentTypeSchema.Reference.ReferenceV3;
            originalSchema?.OneOf.Add(contentTypeSchema);
        }
    }
    private string GetTypeSchemaId<T>(bool baseSuffix)
    {
        return _schemaIdSelector.SchemaId(typeof(T)) + (baseSuffix ? "Base" : null);
    }

    private static void ClearSchema(OpenApiSchema schema)
    {
        schema.AllOf.Clear();
        schema.OneOf.Clear();
        schema.AnyOf.Clear();
        schema.Required.Clear();
        schema.Properties.Clear();
        schema.AdditionalProperties = null;
        schema.Discriminator = null;
    }

    // 🔸 All the helper methods (ApplyPolymorphicContentType, ApplyPolymorphicContentTypeSchema, etc.)
    // 🔸 Copy those unchanged from the original implementation because they remain the same.

    // 🔸 Keep GetTypeSchemaId, ClearSchema, HasMarker, AddMarker, RemoveMarker — same as in the original code.
}
