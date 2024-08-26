import './channel-settings-ui.scss';
import React, { ReactNode } from 'react';
import { ChannelSettingsHeaderProps } from './ChannelSettingsHeader';
import useMenuItems from './hooks/useMenuItems';
import { UserListItemProps } from '../../../../ui/UserListItem';
interface ModerationPanelProps {
    menuItems: ReturnType<typeof useMenuItems>;
}
export interface ChannelSettingsUIProps {
    renderHeader?: (props: ChannelSettingsHeaderProps) => React.ReactElement;
    renderChannelProfile?: () => React.ReactElement;
    renderModerationPanel?: (props: ModerationPanelProps) => React.ReactElement;
    renderLeaveChannel?: () => React.ReactElement;
    renderPlaceholderError?: () => React.ReactElement;
    renderPlaceholderLoading?: () => React.ReactElement;
    /**
     * @deprecated This prop is deprecated and will be removed in the next major update.
     * Please use the `renderUserListItem` prop of the `ChannelSettingsProvider` instead.
     */
    renderUserListItem?: (props: UserListItemProps) => ReactNode;
}
declare const ChannelSettingsUI: (props: ChannelSettingsUIProps) => React.JSX.Element;
export default ChannelSettingsUI;
export { OperatorList } from '../ModerationPanel/OperatorList';
export { MemberList } from '../ModerationPanel/MemberList';
export { MutedMemberList } from '../ModerationPanel/MutedMemberList';
export { BannedUserList } from '../ModerationPanel/BannedUserList';
