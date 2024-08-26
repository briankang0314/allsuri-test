import { ReactElement, ReactNode } from 'react';
import type { BannedUserListQueryParams } from '@sendbird/chat';
import { UserListItemProps } from '../../../../ui/UserListItem';
interface BannedUserListProps {
    renderUserListItem?: (props: UserListItemProps) => ReactNode;
    bannedUserListQueryParams?: BannedUserListQueryParams;
}
export declare const BannedUserList: ({ renderUserListItem, bannedUserListQueryParams, }: BannedUserListProps) => ReactElement;
/** @deprecated Use the BannedUserList instead */
export declare const BannedMemberList: ({ renderUserListItem, bannedUserListQueryParams, }: BannedUserListProps) => ReactElement;
export default BannedUserList;
