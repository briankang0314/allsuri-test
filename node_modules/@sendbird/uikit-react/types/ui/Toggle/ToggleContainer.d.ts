import React from 'react';
import type { ReactNode } from 'react';
import { ToggleContextInterface } from './ToggleContext';
export interface ToggleContainerProps extends ToggleContextInterface {
    children?: ReactNode;
}
export declare function ToggleContainer({ checked, // null
defaultChecked, disabled, onChange, onFocus, onBlur, children, }: ToggleContainerProps): React.ReactElement;
