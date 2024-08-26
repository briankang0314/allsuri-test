import { ChangeEvent, MutableRefObject, ReactElement, ReactNode } from 'react';
import type { User } from '@sendbird/chat';
import type { GroupChannel, Member } from '@sendbird/chat/groupChannel';
import './index.scss';
import { UserListItemMenuProps } from '../UserListItemMenu/UserListItemMenu';
export interface UserListItemProps {
    user: User | Member;
    channel?: GroupChannel;
    className?: string;
    checked?: boolean;
    checkBox?: boolean;
    isOperator?: boolean;
    disabled?: boolean;
    disableMessaging?: boolean;
    /** @deprecated Doesn't need to fill this props */
    currentUser?: string;
    /** @deprecated Use the props `renderListItemMenu` instead */
    action?({ actionRef, parentRef }: {
        actionRef: MutableRefObject<any>;
        parentRef?: MutableRefObject<any>;
    }): ReactElement;
    onChange?(e: ChangeEvent<HTMLInputElement>): void;
    avatarSize?: string;
    /** @deprecated Please use the onUserAvatarClick instead */
    onClick?(): void;
    onUserAvatarClick?(): void;
    renderListItemMenu?: (props: UserListItemMenuProps) => ReactNode;
    size?: 'normal' | 'small';
}
export declare function UserListItem({ user, channel, className, checked, checkBox, isOperator, disabled, disableMessaging, action, onChange, avatarSize, onClick, onUserAvatarClick, renderListItemMenu, size, }: UserListItemProps): ReactElement;
export default UserListItem;
