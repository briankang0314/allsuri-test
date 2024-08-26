import type { SendbirdError } from '@sendbird/chat';
import type { BaseMessage, MessageSearchQuery } from '@sendbird/chat/message';
import { CoreMessageType } from '../../../../utils';
import { LoggerInterface } from '../../../../lib/Logger';
interface MainProps {
    currentMessageSearchQuery: MessageSearchQuery | null;
    hasMoreResult: boolean;
    onResultLoaded?: (messages?: Array<CoreMessageType> | null, error?: SendbirdError | null) => void;
}
type MessageSearchDispatcherType = {
    type: string;
    payload: any;
};
interface ToolProps {
    logger: LoggerInterface;
    messageSearchDispatcher: (payload: MessageSearchDispatcherType) => void;
}
export type CallbackReturn = (callback: (...args: [messages: BaseMessage[], error: null] | [messages: null, error: any]) => void) => void;
declare function useScrollCallback({ currentMessageSearchQuery, hasMoreResult, onResultLoaded }: MainProps, { logger, messageSearchDispatcher }: ToolProps): CallbackReturn;
export default useScrollCallback;
