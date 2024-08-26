import './index.scss';
import { ReactElement } from 'react';
import type { UserMessage } from '@sendbird/chat/message';
interface Props {
    className?: string | Array<string>;
    message: UserMessage;
    isByMe?: boolean;
    mouseHover?: boolean;
    isMentionEnabled?: boolean;
    isReactionEnabled?: boolean;
    isMarkdownEnabled?: boolean;
}
export default function TextMessageItemBody({ className, message, isByMe, mouseHover, isMentionEnabled, isReactionEnabled, isMarkdownEnabled, }: Props): ReactElement;
export {};
