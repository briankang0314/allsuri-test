import { GroupChannel } from '@sendbird/chat/groupChannel';
import { Logger } from '../../../../lib/SendbirdState';
import { BaseMessage } from '@sendbird/chat/message';
interface DynamicProps {
    currentChannel: GroupChannel | null;
}
interface StaticProps {
    logger: Logger;
}
export default function useToggleReactionCallback({ currentChannel, }: DynamicProps, { logger, }: StaticProps): (message: BaseMessage, key: string, isReacted: boolean) => void;
export {};
