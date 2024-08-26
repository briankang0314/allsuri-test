import { ReactElement, ReactNode } from 'react';
import { UserListItemProps } from '../../../../ui/UserListItem';
import { MemberListQueryParams } from '@sendbird/chat/groupChannel';
export interface MutedMembersModalProps {
    onCancel(): void;
    renderUserListItem?: (props: UserListItemProps) => ReactNode;
    memberListQueryParams?: MemberListQueryParams;
}
export declare function MutedMembersModal({ onCancel, renderUserListItem, memberListQueryParams, }: MutedMembersModalProps): ReactElement;
export default MutedMembersModal;
