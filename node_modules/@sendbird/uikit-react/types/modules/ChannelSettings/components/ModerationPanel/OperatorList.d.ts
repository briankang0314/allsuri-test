import { ReactElement, ReactNode } from 'react';
import type { OperatorListQueryParams } from '@sendbird/chat';
import { UserListItemProps } from '../../../../ui/UserListItem';
interface OperatorListProps {
    renderUserListItem?: (props: UserListItemProps) => ReactNode;
    operatorListQueryParams?: OperatorListQueryParams;
}
export declare const OperatorList: ({ renderUserListItem, operatorListQueryParams, }: OperatorListProps) => ReactElement;
export default OperatorList;
