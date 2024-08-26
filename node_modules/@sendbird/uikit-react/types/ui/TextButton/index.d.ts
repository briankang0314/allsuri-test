import { MouseEvent, KeyboardEvent, ReactElement } from 'react';
import './index.scss';
import { Colors } from '../../utils/color';
export interface TextButtonProps {
    className?: string | Array<string>;
    color?: Colors;
    disabled?: boolean;
    disableUnderline?: boolean;
    onClick?: (e: (MouseEvent | KeyboardEvent)) => void;
    children: ReactElement;
}
declare const TextButton: ({ className, color, disabled, disableUnderline, onClick, children, }: TextButtonProps) => ReactElement;
export default TextButton;
