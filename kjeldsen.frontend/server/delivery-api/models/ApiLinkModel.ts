/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiContentRouteModel } from './ApiContentRouteModel';
import type { LinkTypeModel } from './LinkTypeModel';
export type ApiLinkModel = {
    readonly url?: string | null;
    readonly queryString?: string | null;
    readonly title?: string | null;
    readonly target?: string | null;
    readonly destinationId?: string | null;
    readonly destinationType?: string | null;
    readonly route?: ApiContentRouteModel | null;
    linkType: LinkTypeModel;
};

