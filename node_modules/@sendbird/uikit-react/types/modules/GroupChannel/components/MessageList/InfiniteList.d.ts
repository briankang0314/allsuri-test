import React, { DependencyList } from 'react';
import type { BaseMessage } from '@sendbird/chat/message';
type Props = {
    messages: BaseMessage[];
    renderMessage: (props: {
        message: BaseMessage;
        index: number;
    }) => React.ReactNode;
    scrollPositionRef: React.MutableRefObject<number>;
    scrollDistanceFromBottomRef: React.MutableRefObject<number>;
    onLoadPrevious: () => Promise<void>;
    onLoadNext: () => Promise<void>;
    loadThreshold?: number;
    typingIndicator?: React.ReactNode;
    onScrollPosition?: (position: 'top' | 'bottom' | 'middle') => void;
    initDeps?: DependencyList;
};
export declare const InfiniteList: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLDivElement>>;
export {};
