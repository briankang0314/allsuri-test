import React, { MouseEvent, ReactNode } from 'react';
export interface MenuItemProps {
    className?: string;
    disabled?: boolean;
    tabIndex?: number;
    testID?: string;
    onClick?: (e: MouseEvent<HTMLLIElement | HTMLDivElement>) => void;
    children: ReactNode;
}
export declare const MenuItem: ({ className, disabled, tabIndex, testID, onClick, children, }: MenuItemProps) => React.JSX.Element;
export declare const BottomSheetMenuItem: ({ className, disabled, tabIndex, testID, onClick, children, }: MenuItemProps) => React.JSX.Element;
