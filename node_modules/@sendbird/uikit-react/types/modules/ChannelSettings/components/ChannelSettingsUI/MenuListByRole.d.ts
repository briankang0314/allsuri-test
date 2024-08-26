import '../ModerationPanel/admin-panel.scss';
import '../UserPanel/user-panel.scss';
import React from 'react';
import useMenuItems from './hooks/useMenuItems';
interface MenuListByRoleProps {
    menuItems: ReturnType<typeof useMenuItems>;
}
export declare const MenuListByRole: ({ menuItems, }: MenuListByRoleProps) => React.JSX.Element;
export default MenuListByRole;
