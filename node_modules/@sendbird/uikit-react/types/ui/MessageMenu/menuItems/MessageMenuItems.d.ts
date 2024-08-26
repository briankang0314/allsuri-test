import React, { FocusEvent, MouseEvent, MutableRefObject, ReactNode } from 'react';
import { IconProps } from '../../Icon';
import { MenuItemProps } from './BasicItems';
export interface TriggerIconProps {
    ref: MutableRefObject<any>;
    onClick?: (e: MouseEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    renderIcon?: (props: IconProps) => ReactNode;
}
export declare const TriggerIcon: ({ ref, onClick, onBlur, renderIcon, }: TriggerIconProps) => React.JSX.Element;
export type PrebuildMenuItemPropsType = Omit<MenuItemProps, 'children'> & Partial<Pick<MenuItemProps, 'children'>>;
export declare const CopyMenuItem: (props: PrebuildMenuItemPropsType) => React.JSX.Element;
export declare const ReplyMenuItem: (props: PrebuildMenuItemPropsType) => React.JSX.Element;
export declare const ThreadMenuItem: (props: PrebuildMenuItemPropsType) => React.JSX.Element;
export declare const OpenInChannelMenuItem: (props: PrebuildMenuItemPropsType) => React.JSX.Element;
export declare const EditMenuItem: (props: PrebuildMenuItemPropsType) => React.JSX.Element;
export declare const ResendMenuItem: (props: PrebuildMenuItemPropsType) => React.JSX.Element;
export declare const DeleteMenuItem: (props: PrebuildMenuItemPropsType) => React.JSX.Element;
