/**
 * This is a drop in Chat solution
 * Can also be used as an example for creating
 * default chat apps
 */
import React from 'react';
import { SendbirdProviderProps } from '../../lib/Sendbird';
import './index.scss';
import { AppLayoutProps } from './types';
export interface AppProps {
    appId: SendbirdProviderProps['appId'];
    userId: SendbirdProviderProps['userId'];
    accessToken?: SendbirdProviderProps['accessToken'];
    customApiHost?: SendbirdProviderProps['customApiHost'];
    customWebSocketHost?: SendbirdProviderProps['customWebSocketHost'];
    breakpoint?: SendbirdProviderProps['breakpoint'];
    theme?: SendbirdProviderProps['theme'];
    userListQuery?: SendbirdProviderProps['userListQuery'];
    nickname?: SendbirdProviderProps['nickname'];
    profileUrl?: SendbirdProviderProps['profileUrl'];
    dateLocale?: SendbirdProviderProps['dateLocale'];
    config?: SendbirdProviderProps['config'];
    voiceRecord?: SendbirdProviderProps['voiceRecord'];
    isMultipleFilesMessageEnabled?: SendbirdProviderProps['isMultipleFilesMessageEnabled'];
    colorSet?: SendbirdProviderProps['colorSet'];
    stringSet?: SendbirdProviderProps['stringSet'];
    allowProfileEdit?: SendbirdProviderProps['allowProfileEdit'];
    disableMarkAsDelivered?: SendbirdProviderProps['disableMarkAsDelivered'];
    renderUserProfile?: SendbirdProviderProps['renderUserProfile'];
    imageCompression?: SendbirdProviderProps['imageCompression'];
    uikitOptions?: SendbirdProviderProps['uikitOptions'];
    isUserIdUsedForNickname?: SendbirdProviderProps['isUserIdUsedForNickname'];
    sdkInitParams?: SendbirdProviderProps['sdkInitParams'];
    customExtensionParams?: SendbirdProviderProps['customExtensionParams'];
    eventHandlers?: SendbirdProviderProps['eventHandlers'];
    isMessageGroupingEnabled?: AppLayoutProps['isMessageGroupingEnabled'];
    disableAutoSelect?: AppLayoutProps['disableAutoSelect'];
    onProfileEditSuccess?: AppLayoutProps['onProfileEditSuccess'];
    htmlTextDirection?: AppLayoutProps['htmlTextDirection'];
    forceLeftToRightMessageLayout?: AppLayoutProps['forceLeftToRightMessageLayout'];
    /**
     * The default value is false.
     * If this option is enabled, it uses legacy modules (Channel, ChannelList) that are not applied local caching.
     * */
    enableLegacyChannelModules?: boolean;
    /** @deprecated Please use `uikitOptions.common.enableUsingDefaultUserProfile` instead * */
    disableUserProfile?: SendbirdProviderProps['disableUserProfile'];
    /** @deprecated Please use `uikitOptions.groupChannel.replyType` instead * */
    replyType?: SendbirdProviderProps['replyType'];
    /** @deprecated Please use `uikitOptions.groupChannel.enableReactions` instead * */
    isReactionEnabled?: SendbirdProviderProps['isReactionEnabled'];
    /** @deprecated Please use `uikitOptions.groupChannel.enableMention` instead * */
    isMentionEnabled?: SendbirdProviderProps['isMentionEnabled'];
    /** @deprecated Please use `uikitOptions.groupChannel.enableVoiceMessage` instead * */
    isVoiceMessageEnabled?: SendbirdProviderProps['isVoiceMessageEnabled'];
    /** @deprecated Please use `uikitOptions.groupChannelList.enableTypingIndicator` instead * */
    isTypingIndicatorEnabledOnChannelList?: SendbirdProviderProps['isTypingIndicatorEnabledOnChannelList'];
    /** @deprecated Please use `uikitOptions.groupChannelList.enableMessageReceiptStatus` instead * */
    isMessageReceiptStatusEnabledOnChannelList?: SendbirdProviderProps['isMessageReceiptStatusEnabledOnChannelList'];
    /** @deprecated Please use `uikitOptions.groupChannelSettings.enableMessageSearch` instead * */
    showSearchIcon?: SendbirdProviderProps['showSearchIcon'];
}
export default function App(props: AppProps): React.JSX.Element;
