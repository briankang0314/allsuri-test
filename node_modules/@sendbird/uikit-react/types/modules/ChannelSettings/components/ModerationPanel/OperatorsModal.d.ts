import { ReactElement, ReactNode } from 'react';
import { UserListItemProps } from '../../../../ui/UserListItem';
import { OperatorListQueryParams } from '@sendbird/chat';
export interface OperatorsModalProps {
    onCancel?(): void;
    renderUserListItem?: (props: UserListItemProps) => ReactNode;
    operatorListQueryParams?: OperatorListQueryParams;
}
export declare function OperatorsModal({ onCancel, renderUserListItem, operatorListQueryParams, }: OperatorsModalProps): ReactElement;
export default OperatorsModal;
