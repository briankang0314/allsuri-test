import React, { MouseEvent } from 'react';
import { type HeaderCustomProps } from '../../../../ui/Header';
export interface ChannelSettingsHeaderProps extends HeaderCustomProps {
    onCloseClick?: (e: MouseEvent) => void;
}
export declare const ChannelSettingsHeader: ({ onCloseClick, renderLeft, renderMiddle, renderRight, }: ChannelSettingsHeaderProps) => React.JSX.Element;
export default ChannelSettingsHeader;
