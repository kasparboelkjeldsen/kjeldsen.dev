/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageCropModel } from './ImageCropModel';
import type { ImageFocalPointModel } from './ImageFocalPointModel';
export type IApiMediaWithCropsResponseModel = {
    readonly id: string;
    readonly name: string;
    readonly mediaType: string;
    readonly url: string;
    readonly extension?: string | null;
    readonly width?: number | null;
    readonly height?: number | null;
    readonly bytes?: number | null;
    readonly properties: Record<string, any>;
    focalPoint: ImageFocalPointModel;
    readonly crops?: Array<ImageCropModel> | null;
    readonly path: string;
    readonly createDate: string;
    readonly updateDate: string;
};

