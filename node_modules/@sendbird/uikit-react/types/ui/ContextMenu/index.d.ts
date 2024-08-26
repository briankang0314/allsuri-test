import React, { ReactElement, MouseEvent, ReactNode } from 'react';
import './index.scss';
import _MenuItems from './MenuItems';
import { MuteMenuItem } from './items/MuteMenuItem';
import { OperatorMenuItem } from './items/OperatorMenuItem';
export declare const MENU_OBSERVING_CLASS_NAME = "sendbird-observing-message-menu";
export declare const getObservingId: (txt: string | number) => string;
export declare const MenuItems: typeof _MenuItems;
export declare const EmojiListItems: ({ id, children, parentRef, parentContainRef, spaceFromTrigger, closeDropdown, }: import("./EmojiListItems").EmojiListItemsProps) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;
/**
 * @deprecated
 * Use the `MessageItemProps` from '@sendbird/uikit-react/ui/MessageMenu' instead
 */
export interface MenuItemProps {
    className?: string | Array<string>;
    children: ReactElement | ReactElement[] | ReactNode;
    onClick?: (e: MouseEvent<HTMLLIElement>) => void;
    disable?: boolean;
    /**
     * @deprecated Please use the testID instead
     */
    dataSbId?: string;
    testID?: string;
}
/**
 * @deprecated
 * Use the `MenuItem` from '@sendbird/uikit-react/ui/MessageMenu' instead
 */
export declare const MenuItem: ({ className, children, onClick, disable, dataSbId, testID, }: MenuItemProps) => React.JSX.Element;
export declare const MENU_ROOT_ID = "sendbird-dropdown-portal";
export declare const MenuRoot: () => ReactElement;
export declare const EMOJI_MENU_ROOT_ID = "sendbird-emoji-list-portal";
export declare const EmojiReactionListRoot: () => ReactElement;
type MenuDisplayingFunc = () => void;
export interface ContextMenuProps {
    menuTrigger?: (func: MenuDisplayingFunc) => ReactElement;
    menuItems: (func: MenuDisplayingFunc) => ReactElement;
    isOpen?: boolean;
    onClick?: (...args: any[]) => void;
}
export default function ContextMenu({ menuTrigger, menuItems, isOpen, onClick, }: ContextMenuProps): ReactElement;
export { MuteMenuItem, OperatorMenuItem, };
