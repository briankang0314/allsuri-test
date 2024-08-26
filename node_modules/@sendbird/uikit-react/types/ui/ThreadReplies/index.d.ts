import React, { RefObject } from 'react';
import { ThreadInfo } from '@sendbird/chat/message';
import './index.scss';
export interface ThreadRepliesProps {
    className?: string;
    threadInfo: ThreadInfo;
    onClick?: (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
}
export declare function ThreadReplies({ className, threadInfo, onClick, }: ThreadRepliesProps, ref: RefObject<HTMLDivElement>): React.ReactElement;
declare const _default: React.ForwardRefExoticComponent<ThreadRepliesProps & React.RefAttributes<HTMLDivElement>>;
export default _default;
