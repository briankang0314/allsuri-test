import './openchannel-message-list.scss';
import React from 'react';
import { RenderMessageProps } from '../../../../types';
export type OpenChannelMessageListProps = {
    renderMessage?: (props: RenderMessageProps) => React.ReactElement;
    renderPlaceHolderEmptyList?: () => React.ReactElement;
};
/** @deprecated * */
export type OpenchannelMessageListProps = OpenChannelMessageListProps;
declare const _default: React.ForwardRefExoticComponent<OpenChannelMessageListProps & React.RefAttributes<HTMLDivElement>>;
export default _default;
