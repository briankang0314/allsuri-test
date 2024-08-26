import React from 'react';
import { IconProps } from '../../../../../ui/Icon';
import { type LabelProps } from '../../../../../ui/Label';
import { type MenuItemActionProps } from '../MenuItem';
type MenuItem = {
    icon: IconProps;
    label: LabelProps;
    rightComponent?: (props: MenuItemActionProps) => React.ReactNode;
    accordionComponent?: () => React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    hideMenu?: boolean;
};
type MenuItemsByRole = {
    [key: string]: MenuItem;
};
type MenuItems = {
    operator: MenuItemsByRole;
    nonOperator: MenuItemsByRole;
};
export declare const useMenuItems: () => MenuItems;
export default useMenuItems;
