/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiBlockGridModel } from './ApiBlockGridModel';
import type { HeadlessCompositionPropertiesModel } from './HeadlessCompositionPropertiesModel';
import type { SeoCompositionPropertiesModel } from './SeoCompositionPropertiesModel';
export type ContentPagePropertiesModel = (HeadlessCompositionPropertiesModel & SeoCompositionPropertiesModel & {
    grid?: ApiBlockGridModel;
    cacheKeys?: Array<string>;
});

