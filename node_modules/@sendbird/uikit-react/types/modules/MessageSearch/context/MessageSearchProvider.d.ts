import React from 'react';
import { SendbirdError } from '@sendbird/chat';
import type { MessageSearchQuery } from '@sendbird/chat/message';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import type { MessageSearchQueryParams } from '@sendbird/chat/lib/__definition';
import { ClientSentMessages } from '../../../types';
import { State as MessageSearchReducerState } from './dux/initialState';
import { CallbackReturn as UseScrollCallbackType } from './hooks/useScrollCallback';
import { CoreMessageType } from '../../../utils';
export interface MessageSearchProviderProps {
    channelUrl: string;
    children?: React.ReactElement;
    searchString?: string;
    messageSearchQuery?: MessageSearchQueryParams;
    onResultLoaded?(messages?: Array<CoreMessageType> | null, error?: SendbirdError | null): void;
    onResultClick?(message: ClientSentMessages): void;
}
interface MessageSearchProviderInterface extends MessageSearchProviderProps {
    requestString?: string;
    retryCount: number;
    setRetryCount: React.Dispatch<React.SetStateAction<number>>;
    selectedMessageId: number;
    setSelectedMessageId: React.Dispatch<React.SetStateAction<number>>;
    messageSearchDispatcher: (props: {
        type: string;
        payload: any;
    }) => void;
    scrollRef: React.RefObject<HTMLDivElement>;
    allMessages: MessageSearchReducerState['allMessages'];
    loading: boolean;
    isInvalid: boolean;
    currentChannel: GroupChannel;
    currentMessageSearchQuery: MessageSearchQuery;
    hasMoreResult: boolean;
    onScroll: UseScrollCallbackType;
    handleRetryToConnect: () => void;
    handleOnScroll: (e: React.BaseSyntheticEvent) => void;
}
declare const MessageSearchProvider: React.FC<MessageSearchProviderProps>;
declare const useMessageSearchContext: () => MessageSearchProviderInterface;
export { MessageSearchProvider, useMessageSearchContext, };
