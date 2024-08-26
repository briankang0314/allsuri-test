import { ReactElement } from 'react';
import { BaseMessage } from '@sendbird/chat/message';
import { MessageTemplateProps } from '../../../../ui/MessageTemplate';
export interface MessageTemplateWrapperProps extends MessageTemplateProps {
    message: BaseMessage;
}
export declare const MessageTemplateWrapper: ({ message, templateVersion, templateItems, }: MessageTemplateWrapperProps) => ReactElement;
export default MessageTemplateWrapper;
