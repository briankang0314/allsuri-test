import React, { ReactNode } from 'react';
import { type User } from '@sendbird/chat';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import { useToggleBan, useToggleMute, useToggleOperator } from './hooks';
interface UserListItemMenuContextInterface extends UserListItemMenuContextValues, ReturnType<typeof useToggleOperator>, ReturnType<typeof useToggleMute>, ReturnType<typeof useToggleBan> {
    isCurrentUser: boolean;
    isCurrentUserOperator: boolean;
}
export type OnToggleStateHandlerType = (params: {
    user: User;
    newStatus: boolean;
    error?: Error;
}) => void;
export interface UserListItemMenuContextValues {
    channel?: GroupChannel;
    user: User;
    hideMenu: () => void;
    toggleMenu: () => void;
    onToggleOperatorState?: OnToggleStateHandlerType;
    onToggleMuteState?: OnToggleStateHandlerType;
    onToggleBanState?: OnToggleStateHandlerType;
}
export interface UserListItemMenuProviderProps extends UserListItemMenuContextValues {
    children: ReactNode;
    isOperator?: boolean;
    isMuted?: boolean;
    isBanned?: boolean;
}
export declare const UserListItemMenuProvider: ({ children, ...values }: UserListItemMenuProviderProps) => React.JSX.Element;
export declare const useUserListItemMenuContext: () => UserListItemMenuContextInterface;
export {};
