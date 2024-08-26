import React, { MutableRefObject, ReactElement } from 'react';
import type { ToggleMenuItemProps } from './UserListItemMenuItems';
import { UserListItemMenuProviderProps } from './context';
export type RenderUserListItemMenuItemsParams = {
    items: {
        OperatorToggleMenuItem: (props: ToggleMenuItemProps) => ReactElement;
        MuteToggleMenuItem: (props: ToggleMenuItemProps) => ReactElement;
        BanToggleMenuItem: (props: ToggleMenuItemProps) => ReactElement;
    };
};
export interface UserListItemMenuProps extends Omit<UserListItemMenuProviderProps, 'children' | 'hideMenu' | 'toggleMenu'> {
    className?: string;
    renderTrigger?: (props: {
        ref: MutableRefObject<any>;
        toggleMenu: () => void;
    }) => ReactElement;
    renderMenuItems?: (params: RenderUserListItemMenuItemsParams) => ReactElement;
}
export declare const UserListItemMenu: (props: UserListItemMenuProps) => React.JSX.Element;
export default UserListItemMenu;
