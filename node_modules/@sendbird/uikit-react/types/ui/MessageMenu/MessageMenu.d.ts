import React, { ReactElement } from 'react';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { OpenChannel } from '@sendbird/chat/openChannel';
import { SendableMessageType } from '../../utils';
import { type PrebuildMenuItemPropsType, TriggerIconProps } from './menuItems/MessageMenuItems';
import { ReplyType } from '../../types';
export type RenderMenuItemsParams = {
    items: {
        CopyMenuItem: (props: PrebuildMenuItemPropsType) => ReactElement;
        ReplyMenuItem: (props: PrebuildMenuItemPropsType) => ReactElement;
        ThreadMenuItem: (props: PrebuildMenuItemPropsType) => ReactElement;
        OpenInChannelMenuItem: (props: PrebuildMenuItemPropsType) => ReactElement;
        EditMenuItem: (props: PrebuildMenuItemPropsType) => ReactElement;
        ResendMenuItem: (props: PrebuildMenuItemPropsType) => ReactElement;
        DeleteMenuItem: (props: PrebuildMenuItemPropsType) => ReactElement;
    };
};
export interface MessageMenuProps {
    className?: string;
    message: SendableMessageType;
    channel: GroupChannel | OpenChannel | null;
    isByMe?: boolean;
    replyType?: ReplyType;
    renderTrigger?: (params: TriggerIconProps) => ReactElement;
    renderMenuItems?: (params: RenderMenuItemsParams) => ReactElement;
    disableDeleteMessage?: boolean;
    showEdit?: (bool: boolean) => void;
    showRemove?: (bool: boolean) => void;
    deleteMessage?: (message: SendableMessageType) => void;
    resendMessage?: (message: SendableMessageType) => void;
    setQuoteMessage?: (message: SendableMessageType) => void;
    onReplyInThread?: (props: {
        message: SendableMessageType;
    }) => void;
    onMoveToParentMessage?: () => void;
}
export declare const MessageMenu: ({ className, message, channel, isByMe, replyType, renderTrigger, renderMenuItems, disableDeleteMessage, showEdit, showRemove, deleteMessage, resendMessage, setQuoteMessage, onReplyInThread, onMoveToParentMessage, }: MessageMenuProps) => React.JSX.Element;
