/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IApiContentResponseModel } from '../models/IApiContentResponseModel';
import type { PagedIApiContentResponseModel } from '../models/PagedIApiContentResponseModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ContentService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns PagedIApiContentResponseModel OK
     * @throws ApiError
     */
    public getContent20({
        fetch,
        filter,
        sort,
        skip,
        take = 10,
        expand,
        fields,
        acceptLanguage,
        acceptSegment,
        apiKey,
        preview,
        startItem,
    }: {
        /**
         * Specifies the content items to fetch. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this.
         */
        fetch?: string,
        /**
         * Defines how to filter the fetched content items. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this.
         */
        filter?: Array<string>,
        /**
         * Defines how to sort the found content items. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this.
         */
        sort?: Array<string>,
        /**
         * Specifies the number of found content items to skip. Use this to control pagination of the response.
         */
        skip?: number,
        /**
         * Specifies the number of found content items to take. Use this to control pagination of the response.
         */
        take?: number,
        /**
         * Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this.
         */
        expand?: string,
        /**
         * Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this.
         */
        fields?: string,
        /**
         * Defines the language to return. Use this when querying language variant content items.
         */
        acceptLanguage?: string,
        /**
         * Defines the segment to return. Use this when querying segment variant content items.
         */
        acceptSegment?: string,
        /**
         * API key specified through configuration to authorize access to the API.
         */
        apiKey?: string,
        /**
         * Whether to request draft content.
         */
        preview?: boolean,
        /**
         * URL segment or GUID of a root content item.
         */
        startItem?: string,
    }): CancelablePromise<PagedIApiContentResponseModel> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/umbraco/delivery/api/v2/content',
            headers: {
                'Accept-Language': acceptLanguage,
                'Accept-Segment': acceptSegment,
                'Api-Key': apiKey,
                'Preview': preview,
                'Start-Item': startItem,
            },
            query: {
                'fetch': fetch,
                'filter': filter,
                'sort': sort,
                'skip': skip,
                'take': take,
                'expand': expand,
                'fields': fields,
            },
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
            },
        });
    }
    /**
     * @returns IApiContentResponseModel OK
     * @throws ApiError
     */
    public getContentItemByPath20({
        path = '',
        expand,
        fields,
        acceptLanguage,
        acceptSegment,
        apiKey,
        preview,
        startItem,
    }: {
        path?: string,
        /**
         * Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this.
         */
        expand?: string,
        /**
         * Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this.
         */
        fields?: string,
        /**
         * Defines the language to return. Use this when querying language variant content items.
         */
        acceptLanguage?: string,
        /**
         * Defines the segment to return. Use this when querying segment variant content items.
         */
        acceptSegment?: string,
        /**
         * API key specified through configuration to authorize access to the API.
         */
        apiKey?: string,
        /**
         * Whether to request draft content.
         */
        preview?: boolean,
        /**
         * URL segment or GUID of a root content item.
         */
        startItem?: string,
    }): CancelablePromise<IApiContentResponseModel> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/umbraco/delivery/api/v2/content/item/{path}',
            path: {
                'path': path,
            },
            headers: {
                'Accept-Language': acceptLanguage,
                'Accept-Segment': acceptSegment,
                'Api-Key': apiKey,
                'Preview': preview,
                'Start-Item': startItem,
            },
            query: {
                'expand': expand,
                'fields': fields,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * @returns IApiContentResponseModel OK
     * @throws ApiError
     */
    public getContentItemById20({
        id,
        expand,
        fields,
        acceptLanguage,
        acceptSegment,
        apiKey,
        preview,
        startItem,
    }: {
        id: string,
        /**
         * Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this.
         */
        expand?: string,
        /**
         * Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this.
         */
        fields?: string,
        /**
         * Defines the language to return. Use this when querying language variant content items.
         */
        acceptLanguage?: string,
        /**
         * Defines the segment to return. Use this when querying segment variant content items.
         */
        acceptSegment?: string,
        /**
         * API key specified through configuration to authorize access to the API.
         */
        apiKey?: string,
        /**
         * Whether to request draft content.
         */
        preview?: boolean,
        /**
         * URL segment or GUID of a root content item.
         */
        startItem?: string,
    }): CancelablePromise<IApiContentResponseModel> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/umbraco/delivery/api/v2/content/item/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Accept-Language': acceptLanguage,
                'Accept-Segment': acceptSegment,
                'Api-Key': apiKey,
                'Preview': preview,
                'Start-Item': startItem,
            },
            query: {
                'expand': expand,
                'fields': fields,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * @returns IApiContentResponseModel OK
     * @throws ApiError
     */
    public getContentItems20({
        id,
        expand,
        fields,
        acceptLanguage,
        acceptSegment,
        apiKey,
        preview,
        startItem,
    }: {
        id?: Array<string>,
        /**
         * Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this.
         */
        expand?: string,
        /**
         * Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this.
         */
        fields?: string,
        /**
         * Defines the language to return. Use this when querying language variant content items.
         */
        acceptLanguage?: string,
        /**
         * Defines the segment to return. Use this when querying segment variant content items.
         */
        acceptSegment?: string,
        /**
         * API key specified through configuration to authorize access to the API.
         */
        apiKey?: string,
        /**
         * Whether to request draft content.
         */
        preview?: boolean,
        /**
         * URL segment or GUID of a root content item.
         */
        startItem?: string,
    }): CancelablePromise<Array<IApiContentResponseModel>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/umbraco/delivery/api/v2/content/items',
            headers: {
                'Accept-Language': acceptLanguage,
                'Accept-Segment': acceptSegment,
                'Api-Key': apiKey,
                'Preview': preview,
                'Start-Item': startItem,
            },
            query: {
                'id': id,
                'expand': expand,
                'fields': fields,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
}
