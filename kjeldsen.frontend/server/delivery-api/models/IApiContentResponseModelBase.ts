/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiContentRouteModel } from './ApiContentRouteModel';
import type { IApiContentModelBase } from './IApiContentModelBase';
export type IApiContentResponseModelBase = (IApiContentModelBase & {
    properties: {
        readonly id: string;
        readonly contentType: string;
        readonly name?: string | null;
        readonly createDate: string;
        readonly updateDate: string;
        readonly route: ApiContentRouteModel;
    };
    readonly id: string;
    readonly contentType: string;
    readonly name?: string | null;
    readonly createDate: string;
    readonly updateDate: string;
    readonly route: ApiContentRouteModel;
    readonly cultures: Record<string, ApiContentRouteModel>;
});

