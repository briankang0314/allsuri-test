import React from 'react';
import { OpenChannel, OpenChannelUpdateParams } from '@sendbird/chat/openChannel';
import { RenderUserProfileProps } from '../../../types';
export interface OpenChannelSettingsContextProps {
    channelUrl: string;
    children?: React.ReactElement;
    onCloseClick?(): void;
    onBeforeUpdateChannel?(currentTitle: string, currentImg: File, data: string): OpenChannelUpdateParams;
    onChannelModified?(channel: OpenChannel): void;
    onDeleteChannel?(channel: OpenChannel): void;
    disableUserProfile?: boolean;
    renderUserProfile?: (props: RenderUserProfileProps) => React.ReactElement;
}
interface OpenChannelSettingsContextType {
    channelUrl: string;
    channel?: OpenChannel | null;
    isChannelInitialized: boolean;
    setChannel?: React.Dispatch<React.SetStateAction<OpenChannel | null>>;
    onCloseClick?(): void;
    onBeforeUpdateChannel?(currentTitle: string, currentImg: File, data: string): OpenChannelUpdateParams;
    onChannelModified?(channel: OpenChannel): void;
    onDeleteChannel?(channel: OpenChannel): void;
}
declare const OpenChannelSettingsProvider: React.FC<OpenChannelSettingsContextProps>;
declare const useOpenChannelSettingsContext: () => OpenChannelSettingsContextType;
export { OpenChannelSettingsProvider, useOpenChannelSettingsContext, };
