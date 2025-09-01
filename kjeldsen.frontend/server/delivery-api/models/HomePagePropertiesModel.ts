/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiBlockGridModel } from './ApiBlockGridModel';
import type { HeadlessCompositionPropertiesModel } from './HeadlessCompositionPropertiesModel';
import type { IApiMediaWithCropsModel } from './IApiMediaWithCropsModel';
import type { NavigationCompositionPropertiesModel } from './NavigationCompositionPropertiesModel';
import type { SeoCompositionPropertiesModel } from './SeoCompositionPropertiesModel';
export type HomePagePropertiesModel = (SeoCompositionPropertiesModel & NavigationCompositionPropertiesModel & HeadlessCompositionPropertiesModel & {
    grid?: ApiBlockGridModel;
    background?: Array<IApiMediaWithCropsModel> | null;
    cacheKeys?: Array<string>;
});

