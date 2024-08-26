export type ProcessedMessageTemplate = {
    version: number;
    uiTemplate: string;
    colorVariables?: Record<string, string>;
};
export interface MessageTemplatesInfo {
    token: string;
    templatesMap: Record<string, ProcessedMessageTemplate>;
}
export interface WaitingTemplateKeyData {
    requestedAt: number;
    erroredMessageIds: number[];
}
export interface AppInfoStateType {
    messageTemplatesInfo?: MessageTemplatesInfo;
    /**
     * This represents template keys that are currently waiting for its fetch response.
     * Whenever initialized, request succeeds or fails, it needs to be updated.
     */
    waitingTemplateKeysMap: Record<string, WaitingTemplateKeyData>;
}
declare const initialState: AppInfoStateType;
export default initialState;
