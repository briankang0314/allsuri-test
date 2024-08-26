import React, { ReactNode } from 'react';
import './index.scss';
import { MessageEmojiMenuProps } from '../../../../ui/MessageItemReactionMenu';
import { MessageMenuProps } from '../../../../ui/MessageMenu';
export interface ParentMessageInfoProps {
    className?: string;
    renderEmojiMenu?: (props: MessageEmojiMenuProps) => ReactNode;
    renderMessageMenu?: (props: MessageMenuProps) => ReactNode;
}
export default function ParentMessageInfo({ className, renderEmojiMenu, renderMessageMenu, }: ParentMessageInfoProps): React.ReactElement;
