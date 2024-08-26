import type { BaseMessage } from '@sendbird/chat/message';
import React from 'react';
import { LoggerInterface } from '../../../../lib/Logger';
interface DynamicParams {
    setInitialTimeStamp: React.Dispatch<React.SetStateAction<number | null | undefined>>;
    setAnimatedMessageId: React.Dispatch<React.SetStateAction<number | null>>;
    allMessages: BaseMessage[];
    scrollRef: React.RefObject<HTMLDivElement>;
}
interface StaticParams {
    logger: LoggerInterface;
}
declare function useScrollToMessage({ setInitialTimeStamp, setAnimatedMessageId, allMessages, scrollRef, }: DynamicParams, { logger }: StaticParams): (createdAt: number, messageId: number) => void;
export default useScrollToMessage;
