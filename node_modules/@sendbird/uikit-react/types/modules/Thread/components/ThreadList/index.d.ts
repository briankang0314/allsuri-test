import React, { RefObject } from 'react';
import './index.scss';
import type { SendableMessageType } from '../../../../utils';
import { ThreadListItemProps } from './ThreadListItem';
export interface ThreadListProps {
    className?: string;
    renderMessage?: (props: ThreadListItemProps) => React.ReactElement;
    renderCustomSeparator?: (props: {
        message: SendableMessageType;
    }) => React.ReactElement;
    scrollRef?: RefObject<HTMLDivElement>;
    scrollBottom?: number;
}
export default function ThreadList({ className, renderMessage, renderCustomSeparator, scrollRef, scrollBottom, }: ThreadListProps): React.ReactElement;
