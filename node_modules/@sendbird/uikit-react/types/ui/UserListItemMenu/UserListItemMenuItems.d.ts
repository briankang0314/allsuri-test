import React, { ReactNode } from 'react';
import { MenuItemProps } from '../MessageMenu';
export interface ToggleMenuItemProps extends Omit<MenuItemProps, 'children'> {
    children?: ReactNode;
}
export declare const OperatorToggleMenuItem: (props: ToggleMenuItemProps) => React.JSX.Element;
export declare const MuteToggleMenuItem: (props: ToggleMenuItemProps) => React.JSX.Element;
export declare const BanToggleMenuItem: (props: ToggleMenuItemProps) => React.JSX.Element;
