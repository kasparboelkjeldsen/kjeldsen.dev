/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiBlockGridModel } from './ApiBlockGridModel';
import type { ApiBlockListModel } from './ApiBlockListModel';
import type { ApiLinkModel } from './ApiLinkModel';
import type { IApiContentModel } from './IApiContentModel';
import type { IApiMediaWithCropsModel } from './IApiMediaWithCropsModel';
import type { RichTextModel } from './RichTextModel';
export type TestBlockPropertiesModel = {
    decimal?: number | null;
    email?: string | null;
    numeric?: number | null;
    slider?: number | null;
    tags?: Array<string> | null;
    textarea?: string | null;
    textbox?: string | null;
    toggle?: boolean | null;
    checkboxlist?: Array<string> | null;
    dropdown?: string | null;
    blocklist?: ApiBlockListModel;
    dropdownMultiple?: Array<string> | null;
    multipleTextString?: Array<string> | null;
    radioButtonList?: string | null;
    mediaPicker?: Array<IApiMediaWithCropsModel> | null;
    multipleMediaPicker?: Array<IApiMediaWithCropsModel> | null;
    userPicker?: number | null;
    colorPicker?: string | null;
    contentPicker?: Array<IApiContentModel> | null;
    datePicker?: string | null;
    dateAndTimePicker?: string | null;
    documentPicker?: IApiContentModel;
    eyeDropPicker?: string | null;
    multiUrlPicker?: Array<ApiLinkModel> | null;
    blockGrid?: ApiBlockGridModel;
    codeEditor?: string | null;
    markDownEditor?: string | null;
    richTextEditor?: RichTextModel;
    cacheKeys?: Array<string>;
};

