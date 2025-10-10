/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SegmentedContentListResponseModel } from '../models/SegmentedContentListResponseModel';
import type { SegmentedContentResponseModel } from '../models/SegmentedContentResponseModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SegmentationContentService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns any OK
     * @throws ApiError
     */
    public getSegmentationContentSegments({
        apiKey,
    }: {
        /**
         * API key specified through configuration to authorize access to the API.
         */
        apiKey?: string,
    }): CancelablePromise<SegmentedContentListResponseModel> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/umbraco/engage/api/v1/segmentation/content/segments',
            headers: {
                'Api-Key': apiKey,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public getSegmentationContentSegmentsByPath({
        path,
        apiKey,
    }: {
        path: string,
        /**
         * API key specified through configuration to authorize access to the API.
         */
        apiKey?: string,
    }): CancelablePromise<SegmentedContentResponseModel> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/umbraco/engage/api/v1/segmentation/content/segments/{path}',
            path: {
                'path': path,
            },
            headers: {
                'Api-Key': apiKey,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public getSegmentationContentSegmentsById({
        id,
        apiKey,
    }: {
        id: string,
        /**
         * API key specified through configuration to authorize access to the API.
         */
        apiKey?: string,
    }): CancelablePromise<SegmentedContentResponseModel> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/umbraco/engage/api/v1/segmentation/content/segments/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Api-Key': apiKey,
            },
        });
    }
}
