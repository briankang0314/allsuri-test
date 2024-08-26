import { ReactElement, ReactNode } from 'react';
import { UserListItemProps } from '../../../../ui/UserListItem';
import { BannedUserListQueryParams } from '@sendbird/chat';
export interface BannedUsersModalProps {
    onCancel(): void;
    renderUserListItem?: (props: UserListItemProps) => ReactNode;
    bannedUserListQueryParams?: BannedUserListQueryParams;
}
export declare function BannedUsersModal({ onCancel, renderUserListItem, bannedUserListQueryParams, }: BannedUsersModalProps): ReactElement;
export default BannedUsersModal;
