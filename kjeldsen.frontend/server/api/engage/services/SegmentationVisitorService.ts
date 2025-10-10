/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SegmentedContentResponseModel } from '../models/SegmentedContentResponseModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SegmentationVisitorService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns any OK
     * @throws ApiError
     */
    public getSegmentationContentActivesegmentsByPath({
        path = '',
        apiKey,
        acceptLanguage,
        externalVisitorId,
    }: {
        path?: string,
        /**
         * API key specified through configuration to authorize access to the API.
         */
        apiKey?: string,
        /**
         * Defines the language to return. Use this when querying language variant content items.
         */
        acceptLanguage?: string,
        /**
         * Use this to override the default (cookie-based) visitor ID when making requests on behalf of a visitor.<br> This will impact API behaviour like querying Segmented Content, Pageview Tracking, etc.
         */
        externalVisitorId?: string,
    }): CancelablePromise<SegmentedContentResponseModel> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/umbraco/engage/api/v1/segmentation/content/activesegments/{path}',
            path: {
                'path': path,
            },
            headers: {
                'Api-Key': apiKey,
                'Accept-Language': acceptLanguage,
                'External-Visitor-Id': externalVisitorId,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public getSegmentationContentActivesegmentsById({
        id,
        apiKey,
        acceptLanguage,
        externalVisitorId,
    }: {
        id: string,
        /**
         * API key specified through configuration to authorize access to the API.
         */
        apiKey?: string,
        /**
         * Defines the language to return. Use this when querying language variant content items.
         */
        acceptLanguage?: string,
        /**
         * Use this to override the default (cookie-based) visitor ID when making requests on behalf of a visitor.<br> This will impact API behaviour like querying Segmented Content, Pageview Tracking, etc.
         */
        externalVisitorId?: string,
    }): CancelablePromise<SegmentedContentResponseModel> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/umbraco/engage/api/v1/segmentation/content/activesegments/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Api-Key': apiKey,
                'Accept-Language': acceptLanguage,
                'External-Visitor-Id': externalVisitorId,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }
}
