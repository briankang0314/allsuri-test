import React from 'react';
import { AppInfoStateType, ProcessedMessageTemplate } from '../dux/appInfo/initialState';
import SendbirdChat from '@sendbird/chat';
import { AppInfoActionTypes } from '../dux/appInfo/actionTypes';
import { LoggerInterface } from '../Logger';
interface UseMessageTemplateUtilsProps {
    sdk: SendbirdChat;
    logger: LoggerInterface;
    appInfoStore: AppInfoStateType;
    appInfoDispatcher: React.Dispatch<AppInfoActionTypes>;
}
export interface UseMessageTemplateUtilsWrapper {
    getCachedTemplate: (key: string) => ProcessedMessageTemplate | null;
    updateMessageTemplatesInfo: (templateKeys: string[], messageId: number, requestedAt: number) => Promise<void>;
    initializeMessageTemplatesInfo: (readySdk: SendbirdChat) => Promise<void>;
}
export default function useMessageTemplateUtils({ sdk, logger, appInfoStore, appInfoDispatcher, }: UseMessageTemplateUtilsProps): UseMessageTemplateUtilsWrapper;
export {};
