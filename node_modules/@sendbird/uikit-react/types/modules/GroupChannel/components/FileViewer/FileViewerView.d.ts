import './index.scss';
import React, { MouseEvent } from 'react';
import type { FileViewerProps } from '.';
import type { CoreMessageType, SendableMessageType } from '../../../../utils';
type DeleteMessageTypeLegacy = (message: CoreMessageType) => Promise<void>;
export interface FileViewerViewProps extends FileViewerProps {
    deleteMessage: ((message: SendableMessageType) => Promise<void>) | DeleteMessageTypeLegacy;
    onDownloadClick?: (e: MouseEvent) => Promise<void>;
}
export declare const FileViewerView: ({ message, onCancel, deleteMessage, onDownloadClick, }: FileViewerViewProps) => React.ReactNode;
export interface FileViewerUIProps {
    profileUrl: string;
    nickname: string;
    name: string;
    type: string;
    url: string;
    isByMe: boolean;
    onCancel: () => void;
    onDelete: () => void;
    disableDelete: boolean;
    onDownloadClick?: (e: MouseEvent) => Promise<void>;
}
export declare const FileViewerComponent: ({ profileUrl, nickname, name, type, url, isByMe, onCancel, onDelete, disableDelete, onDownloadClick, }: FileViewerUIProps) => React.JSX.Element;
export {};
