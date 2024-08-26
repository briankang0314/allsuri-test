import { ReactElement, ReactNode } from 'react';
import type { MemberListQueryParams } from '@sendbird/chat/groupChannel';
import { type UserListItemProps } from '../../../../ui/UserListItem';
export interface MembersModalProps {
    onCancel(): void;
    renderUserListItem?: (props: UserListItemProps & {
        index: number;
    }) => ReactNode;
    memberListQueryParams?: MemberListQueryParams;
}
export declare function MembersModal({ onCancel, renderUserListItem, memberListQueryParams, }: MembersModalProps): ReactElement;
export default MembersModal;
