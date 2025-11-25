/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiBlockListModel } from './ApiBlockListModel';
import type { RichTextModel } from './RichTextModel';
export type CardBlockPropertiesModel = {
    title?: string | null;
    text?: RichTextModel;
    cards?: ApiBlockListModel;
    cacheKeys?: Array<string>;
};

