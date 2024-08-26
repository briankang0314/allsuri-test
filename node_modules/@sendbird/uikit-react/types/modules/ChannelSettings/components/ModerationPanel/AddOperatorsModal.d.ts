import { ReactElement, ReactNode } from 'react';
import { UserListItemProps } from '../../../../ui/UserListItem';
export interface AddOperatorsModalProps {
    onCancel(): void;
    onSubmit(members: Array<string>): void;
    renderUserListItem?: (props: UserListItemProps) => ReactNode;
}
export default function AddOperatorsModal({ onCancel, onSubmit, renderUserListItem, }: AddOperatorsModalProps): ReactElement;
