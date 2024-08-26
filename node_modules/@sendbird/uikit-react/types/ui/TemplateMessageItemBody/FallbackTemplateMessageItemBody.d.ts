import type { BaseMessage } from '@sendbird/chat/message';
import { ReactElement } from 'react';
export interface FallbackTemplateMessageItemBodyProps {
    className?: string | Array<string>;
    message: BaseMessage;
    isByMe?: boolean;
}
export declare function FallbackTemplateMessageItemBody({ className, message, isByMe, }: FallbackTemplateMessageItemBodyProps): ReactElement;
export default FallbackTemplateMessageItemBody;
