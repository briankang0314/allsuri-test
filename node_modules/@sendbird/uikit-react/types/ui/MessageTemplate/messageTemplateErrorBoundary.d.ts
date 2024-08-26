import { Component, ErrorInfo, ReactNode } from 'react';
import { LoggerInterface } from '../../lib/Logger';
import { RenderedTemplateBodyType } from '../MessageContent/MessageBody';
interface ErrorBoundaryProps {
    children: ReactNode;
    fallbackMessage: ReactNode;
    onTemplateMessageRenderedCallback: (renderedTemplateBodyType: RenderedTemplateBodyType) => void;
    isComposite?: boolean;
    logger?: LoggerInterface;
}
interface ErrorBoundaryState {
    hasError: boolean;
}
export declare class MessageTemplateErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(): {
        hasError: boolean;
    };
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    render(): ReactNode;
}
export default MessageTemplateErrorBoundary;
