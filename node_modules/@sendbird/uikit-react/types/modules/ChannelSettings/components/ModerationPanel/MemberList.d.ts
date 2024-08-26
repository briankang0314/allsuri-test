import { ReactElement, ReactNode } from 'react';
import type { MemberListQueryParams } from '@sendbird/chat/groupChannel';
import { UserListItemProps } from '../../../../ui/UserListItem';
interface MemberListProps {
    renderUserListItem?: (props: UserListItemProps & {
        index: number;
    }) => ReactNode;
    memberListQueryParams?: MemberListQueryParams;
}
export declare const MemberList: ({ renderUserListItem, memberListQueryParams, }: MemberListProps) => ReactElement;
export default MemberList;
