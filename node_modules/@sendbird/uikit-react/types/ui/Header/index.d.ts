import React from 'react';
import type { MouseEvent, KeyboardEvent, TouchEvent, ReactNode, ReactElement } from 'react';
import './index.scss';
import type { Types as IconTypes } from '../Icon/type';
import type { Colors as IconColors } from '../Icon/colors';
export interface HeaderCustomProps {
    renderLeft?: () => ReactNode;
    renderRight?: () => ReactNode;
    renderMiddle?: () => ReactNode;
}
export interface HeaderProps extends HeaderCustomProps {
    className?: string;
}
export declare const Header: ({ className, renderLeft, renderRight, renderMiddle, }: HeaderProps) => React.JSX.Element;
export interface HeaderTitleProps {
    title?: string;
    subtitle?: string;
    onClickSubtitle?: (e: MouseEvent | TouchEvent | KeyboardEvent) => void;
}
export declare const Title: ({ title, subtitle, onClickSubtitle, }: HeaderTitleProps) => React.JSX.Element;
export interface HeaderIconButtonProps {
    className?: string;
    onClick?: (e: MouseEvent) => void;
    type: IconTypes;
    color?: IconColors;
    width?: string;
    height?: string;
    renderIcon?: (props: HeaderIconProps) => ReactElement;
}
export declare const IconButton: ({ className, onClick, type, color, width, height, renderIcon, }: HeaderIconButtonProps) => React.JSX.Element;
export interface HeaderIconProps {
    className?: string;
    type: IconTypes;
    color?: IconColors;
    width?: string;
    height?: string;
    onClick?: (e: MouseEvent) => void;
}
export declare const Icon: ({ className, type, color, width, height, onClick, }: HeaderIconProps) => React.JSX.Element;
declare const _default: (({ className, renderLeft, renderRight, renderMiddle, }: HeaderProps) => React.JSX.Element) & {
    Title: ({ title, subtitle, onClickSubtitle, }: HeaderTitleProps) => React.JSX.Element;
    IconButton: ({ className, onClick, type, color, width, height, renderIcon, }: HeaderIconButtonProps) => React.JSX.Element;
    Icon: ({ className, type, color, width, height, onClick, }: HeaderIconProps) => React.JSX.Element;
};
export default _default;
