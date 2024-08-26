import React, { ReactNode } from 'react';
import { type UserListItemProps } from '../../../../ui/UserListItem';
type UserId = string;
export interface InviteUsersModalProps {
    onCancel(): void;
    onSubmit(userIds: UserId[]): void;
    renderUserListItem?: (props: UserListItemProps) => ReactNode;
}
export declare function InviteUsersModal({ onCancel, onSubmit, renderUserListItem, }: InviteUsersModalProps): React.JSX.Element;
export default InviteUsersModal;
