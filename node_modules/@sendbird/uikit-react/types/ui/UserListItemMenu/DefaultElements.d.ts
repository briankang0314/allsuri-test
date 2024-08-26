import React, { MutableRefObject } from 'react';
import { RenderUserListItemMenuItemsParams } from './UserListItemMenu';
interface TriggerIconProps {
    toggleMenu: () => void;
    ref: MutableRefObject<any>;
}
export declare const TriggerIcon: ({ toggleMenu, ref, }: TriggerIconProps) => React.JSX.Element;
export declare const DefaultMenuItems: ({ items }: RenderUserListItemMenuItemsParams) => React.JSX.Element;
export {};
