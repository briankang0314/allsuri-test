import './open-channel-ui.scss';
import React from 'react';
import { RenderMessageProps } from '../../../../types';
export interface OpenChannelUIProps {
    renderMessage?: (props: RenderMessageProps) => React.ReactElement;
    renderHeader?: () => React.ReactElement;
    renderMessageInput?: () => React.ReactElement;
    renderPlaceHolderEmptyList?: () => React.ReactElement;
    renderPlaceHolderError?: () => React.ReactElement;
    renderPlaceHolderLoading?: () => React.ReactElement;
    /** @deprecated Please use renderMessageInput instead * */
    renderInput?: () => React.ReactElement;
}
declare const OpenChannelUI: React.FC<OpenChannelUIProps>;
export default OpenChannelUI;
