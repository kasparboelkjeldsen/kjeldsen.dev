/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';
import { AnalyticsService } from './services/AnalyticsService';
import { SegmentationAssetsService } from './services/SegmentationAssetsService';
import { SegmentationContentService } from './services/SegmentationContentService';
import { SegmentationVisitorService } from './services/SegmentationVisitorService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class EngageClient {
    public readonly analytics: AnalyticsService;
    public readonly segmentationAssets: SegmentationAssetsService;
    public readonly segmentationContent: SegmentationContentService;
    public readonly segmentationVisitor: SegmentationVisitorService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? '',
            VERSION: config?.VERSION ?? '1',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.analytics = new AnalyticsService(this.request);
        this.segmentationAssets = new SegmentationAssetsService(this.request);
        this.segmentationContent = new SegmentationContentService(this.request);
        this.segmentationVisitor = new SegmentationVisitorService(this.request);
    }
}

