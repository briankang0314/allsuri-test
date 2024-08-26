import './index.scss';
import React from 'react';
export interface SuggestedRepliesProps {
    replyOptions: string[];
    onSendMessage: ({ message }: {
        message: string;
    }) => void;
    type?: 'vertical' | 'horizontal';
    gap?: number;
}
export interface ReplyItemProps {
    value: string;
    onClickReply: (event: React.MouseEvent<HTMLDivElement>, option: string) => void;
    type?: 'vertical' | 'horizontal';
}
export declare const ReplyItem: ({ value, onClickReply, type, }: ReplyItemProps) => React.JSX.Element;
declare const SuggestedReplies: ({ replyOptions, onSendMessage, type }: SuggestedRepliesProps) => React.JSX.Element;
export default SuggestedReplies;
