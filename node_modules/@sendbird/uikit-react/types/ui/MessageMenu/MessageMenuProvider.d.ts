import React, { ReactNode, MutableRefObject, MouseEvent } from 'react';
import { SendableMessageType } from '../../utils';
interface CommonMessageMenuContextProps {
    message: SendableMessageType;
    hideMenu: () => void;
    setQuoteMessage: (message: SendableMessageType) => void;
    onReplyInThread: (props: {
        message: SendableMessageType;
    }) => void;
    onMoveToParentMessage: () => void;
    showEdit: (bool: boolean) => void;
    showRemove: (bool: boolean) => void;
    deleteMessage: (message: SendableMessageType) => void;
    resendMessage: (message: SendableMessageType) => void;
    isOnline: boolean;
    disableDeleteMessage: boolean | null;
    triggerRef: MutableRefObject<null>;
    containerRef: MutableRefObject<null>;
}
export interface MessageMenuContextProps extends CommonMessageMenuContextProps {
    showMenu: () => void;
    toggleMenu: () => void;
}
export interface MobileMessageMenuContextProps extends CommonMessageMenuContextProps {
    onDownloadClick?: (e: MouseEvent) => Promise<void>;
}
interface MessageMenuProviderProps {
    children: ReactNode;
    value: MessageMenuContextProps | MobileMessageMenuContextProps;
}
export declare const MessageMenuProvider: ({ children, value }: MessageMenuProviderProps) => React.JSX.Element;
export declare const useMessageMenuContext: () => MessageMenuContextProps | MobileMessageMenuContextProps;
export {};
