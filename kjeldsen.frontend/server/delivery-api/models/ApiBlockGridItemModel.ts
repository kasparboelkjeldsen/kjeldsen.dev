/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiBlockGridAreaModel } from './ApiBlockGridAreaModel';
import type { ApiBlockItemModel } from './ApiBlockItemModel';
export type ApiBlockGridItemModel = (ApiBlockItemModel & {
    rowSpan?: number;
    columnSpan?: number;
    areaGridColumns?: number;
    areas?: Array<ApiBlockGridAreaModel>;
});

