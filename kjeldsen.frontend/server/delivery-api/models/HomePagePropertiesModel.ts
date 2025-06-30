/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiBlockGridModel } from './ApiBlockGridModel';
import type { HeadlessCompositionPropertiesModel } from './HeadlessCompositionPropertiesModel';
import type { NavigationCompositionPropertiesModel } from './NavigationCompositionPropertiesModel';
import type { SeoCompositionPropertiesModel } from './SeoCompositionPropertiesModel';
export type HomePagePropertiesModel = (SeoCompositionPropertiesModel & HeadlessCompositionPropertiesModel & NavigationCompositionPropertiesModel & {
    grid?: ApiBlockGridModel;
    cacheKeys?: Array<string>;
});

