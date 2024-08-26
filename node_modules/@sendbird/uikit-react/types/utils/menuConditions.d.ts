import type { GroupChannel } from '@sendbird/chat/groupChannel';
import type { OpenChannel } from '@sendbird/chat/openChannel';
import { SendableMessageType } from '.';
export declare const isReplyTypeMessageEnabled: ({ channel, message }: {
    channel: any;
    message: any;
}) => boolean;
export interface MenuConditionsParams {
    message: SendableMessageType;
    channel: GroupChannel | OpenChannel;
    isByMe: boolean;
    replyType: string;
    onMoveToParentMessage?: (() => void) | null;
    onReplyInThread?: (props: {
        message: SendableMessageType;
    }) => void;
}
export declare const showMenuItemCopy: ({ message }: MenuConditionsParams) => boolean;
export declare const showMenuItemEdit: ({ message, channel, isByMe }: MenuConditionsParams) => boolean;
export declare const showMenuItemResend: ({ message, isByMe }: MenuConditionsParams) => boolean;
export declare const showMenuItemDelete: ({ message, channel, isByMe }: MenuConditionsParams) => boolean;
export declare const showMenuItemOpenInChannel: ({ onMoveToParentMessage }: MenuConditionsParams) => boolean;
export declare const showMenuItemReply: ({ channel, message, replyType }: MenuConditionsParams) => boolean;
export declare const showMenuItemThread: ({ channel, message, replyType, onReplyInThread }: MenuConditionsParams) => boolean;
