import React from 'react';
import './index.scss';
interface Props {
    appId: string;
    channelUrl?: string;
    userId: string;
    nickname: string;
    theme?: 'light' | 'dark';
    imageCompression?: {
        compressionRate?: number;
        resizingWidth?: number | string;
        resizingHeight?: number | string;
    };
}
export default function OpenChannelApp({ appId, channelUrl: legacyChannelUrl, userId, nickname, theme, imageCompression, }: Props): React.JSX.Element;
export {};
