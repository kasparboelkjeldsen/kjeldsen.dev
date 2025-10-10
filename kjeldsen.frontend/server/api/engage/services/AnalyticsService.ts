/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PageEventRequestModel } from '../models/PageEventRequestModel';
import type { RemotePageViewClientRequestModel } from '../models/RemotePageViewClientRequestModel';
import type { RemotePageViewResponseModel } from '../models/RemotePageViewResponseModel';
import type { RemotePageViewServerRequestModel } from '../models/RemotePageViewServerRequestModel';
import type { StatusCodeResult } from '../models/StatusCodeResult';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AnalyticsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns any OK
     * @throws ApiError
     */
    public postAnalyticsPageeventTrackpageevent({
        pageviewId,
        apiKey,
        externalVisitorId,
        requestBody,
    }: {
        /**
         * The unique identifier of the Pageview, as retrieved via the Analytics trackpageview API.
         */
        pageviewId: string,
        /**
         * API key specified through configuration to authorize access to the API.
         */
        apiKey?: string,
        /**
         * Use this to override the default (cookie-based) visitor ID when making requests on behalf of a visitor.<br> This will impact API behaviour like querying Segmented Content, Pageview Tracking, etc.
         */
        externalVisitorId?: string,
        requestBody?: PageEventRequestModel,
    }): CancelablePromise<StatusCodeResult> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/umbraco/engage/api/v1/analytics/pageevent/trackpageevent',
            headers: {
                'Api-Key': apiKey,
                'External-Visitor-Id': externalVisitorId,
                'Pageview-Id': pageviewId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public postAnalyticsPageviewTrackpageviewClient({
        apiKey,
        externalVisitorId,
        requestBody,
    }: {
        /**
         * API key specified through configuration to authorize access to the API.
         */
        apiKey?: string,
        /**
         * Use this to override the default (cookie-based) visitor ID when making requests on behalf of a visitor.<br> This will impact API behaviour like querying Segmented Content, Pageview Tracking, etc.
         */
        externalVisitorId?: string,
        requestBody?: RemotePageViewClientRequestModel,
    }): CancelablePromise<RemotePageViewResponseModel> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/umbraco/engage/api/v1/analytics/pageview/trackpageview/client',
            headers: {
                'Api-Key': apiKey,
                'External-Visitor-Id': externalVisitorId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                402: `Payment Required`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public postAnalyticsPageviewTrackpageviewServer({
        apiKey,
        externalVisitorId,
        requestBody,
    }: {
        /**
         * API key specified through configuration to authorize access to the API.
         */
        apiKey?: string,
        /**
         * Use this to override the default (cookie-based) visitor ID when making requests on behalf of a visitor.<br> This will impact API behaviour like querying Segmented Content, Pageview Tracking, etc.
         */
        externalVisitorId?: string,
        requestBody?: RemotePageViewServerRequestModel,
    }): CancelablePromise<RemotePageViewResponseModel> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/umbraco/engage/api/v1/analytics/pageview/trackpageview/server',
            headers: {
                'Api-Key': apiKey,
                'External-Visitor-Id': externalVisitorId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                402: `Payment Required`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
}
