/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SegmentDetailsResponseModel } from './SegmentDetailsResponseModel';
export type SegmentedContentResponseModel = {
    contentTypeAlias?: string | null;
    contentId: number;
    contentGuid: string;
    contentUrls?: Array<string> | null;
    segments: Array<SegmentDetailsResponseModel>;
};

