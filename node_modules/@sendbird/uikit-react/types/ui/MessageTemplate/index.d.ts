import React from 'react';
import { type ComponentsUnion } from '@sendbird/uikit-message-template';
import './index.scss';
export interface MessageTemplateProps {
    templateVersion: number;
    templateItems: ComponentsUnion['properties'][];
}
export declare function MessageTemplate({ templateItems, templateVersion }: MessageTemplateProps): React.JSX.Element;
export default MessageTemplate;
