import './index.scss';
import React from 'react';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import { type HeaderCustomProps } from '../../../../ui/Header';
export interface GroupChannelHeaderViewProps extends HeaderCustomProps {
    className?: string;
    currentChannel: GroupChannel;
    showSearchIcon?: boolean;
    onBackClick?: () => void;
    onSearchClick?: () => void;
    onChatHeaderActionClick?(event: React.MouseEvent<HTMLElement>): void;
}
export declare const GroupChannelHeaderView: ({ className, currentChannel, showSearchIcon, onBackClick, onSearchClick, onChatHeaderActionClick, renderLeft, renderMiddle, renderRight, }: GroupChannelHeaderViewProps) => React.JSX.Element;
export default GroupChannelHeaderView;
