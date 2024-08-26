import { ReactElement, ReactNode } from 'react';
import type { MemberListQueryParams } from '@sendbird/chat/groupChannel';
import { UserListItemProps } from '../../../../ui/UserListItem';
interface MutedMemberListProps {
    renderUserListItem?: (props: UserListItemProps) => ReactNode;
    memberListQueryParams?: MemberListQueryParams;
}
export declare const MutedMemberList: ({ renderUserListItem, memberListQueryParams, }: MutedMemberListProps) => ReactElement;
export default MutedMemberList;
