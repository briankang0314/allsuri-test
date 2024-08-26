import { User } from '@sendbird/chat';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { CustomUseReducerDispatcher, Logger } from '../../../../lib/SendbirdState';
import { SBUGlobalPubSub } from '../../../../lib/pubSub/topics';
interface DynamicProps {
    currentChannel: GroupChannel | null;
    isMentionEnabled?: boolean;
}
interface StaticProps {
    logger: Logger;
    pubSub: SBUGlobalPubSub;
    threadDispatcher: CustomUseReducerDispatcher;
}
type CallbackParams = {
    messageId: number;
    message: string;
    mentionedUsers?: User[];
    mentionTemplate?: string;
};
export default function useUpdateMessageCallback({ currentChannel, isMentionEnabled, }: DynamicProps, { logger, pubSub, threadDispatcher, }: StaticProps): (props: CallbackParams) => void;
export {};
