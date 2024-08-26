import React from 'react';
import type { MouseEvent, KeyboardEvent, TouchEvent } from 'react';
type EventType = MouseEvent | KeyboardEvent | TouchEvent;
export interface ThreadHeaderProps {
    className?: string;
    channelName: string;
    renderActionIcon?: (props: {
        onActionIconClick: (e: EventType) => void;
    }) => React.ReactElement;
    onActionIconClick?: (e: EventType) => void;
    onChannelNameClick?: (e: EventType) => void;
}
export default function ThreadHeader({ className, channelName, renderActionIcon, onActionIconClick, onChannelNameClick, }: ThreadHeaderProps): React.ReactElement;
export {};
