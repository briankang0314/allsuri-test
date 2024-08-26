import { ReactElement, ReactNode, MouseEvent, KeyboardEvent } from 'react';
import './index.scss';
import { ButtonTypes } from '../Button';
export interface ModalHeaderProps {
    titleText: string;
    onCloseClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}
export declare const ModalHeader: ({ titleText, onCloseClick }: ModalHeaderProps) => ReactElement;
export interface ModalBodyProps {
    children?: ReactNode;
}
export declare const ModalBody: ({ children }: ModalBodyProps) => ReactElement;
export interface ModalFooterProps {
    submitText: string;
    disabled?: boolean;
    type?: ButtonTypes;
    onCancel: () => void;
    onSubmit: () => void;
    hideCancelButton?: boolean;
}
export declare const ModalFooter: ({ submitText, disabled, hideCancelButton, type, onSubmit, onCancel, }: ModalFooterProps) => ReactElement;
export interface ModalProps {
    children?: ReactNode;
    className?: string;
    contentClassName?: string | Array<string>;
    isCloseOnClickOutside?: boolean;
    isFullScreenOnMobile?: boolean;
    titleText?: string;
    submitText?: string;
    disabled?: boolean;
    hideFooter?: boolean;
    type?: ButtonTypes;
    onClose?: (e?: MouseEvent | KeyboardEvent) => void;
    onSubmit?: (...args: any[]) => void;
    renderHeader?: () => ReactElement;
    customFooter?: ReactNode;
    /** @deprecated Please use `onClose` instead, we will remove `onCancel` in v4. * */
    onCancel?: () => void;
}
export declare function Modal(props: ModalProps): ReactElement;
export default Modal;
