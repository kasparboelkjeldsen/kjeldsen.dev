/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiBlockGridModel } from './ApiBlockGridModel';
import type { HeadlessCompositionPropertiesModel } from './HeadlessCompositionPropertiesModel';
import type { IApiContentModel } from './IApiContentModel';
import type { SeoCompositionPropertiesModel } from './SeoCompositionPropertiesModel';
export type BlogPostPagePropertiesModel = (HeadlessCompositionPropertiesModel & SeoCompositionPropertiesModel & {
    grid?: ApiBlockGridModel;
    writer?: Array<IApiContentModel> | null;
    cacheKeys?: Array<string>;
});

