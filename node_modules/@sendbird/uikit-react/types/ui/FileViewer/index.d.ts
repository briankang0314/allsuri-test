import './index.scss';
import { FileMessage, MultipleFilesMessage } from '@sendbird/chat/message';
import { MouseEvent, ReactElement } from 'react';
import { FileViewerComponentProps } from './types';
import { UploadedFileInfoWithUpload } from '../../types';
export declare const FileViewerComponent: (props: FileViewerComponentProps) => ReactElement;
export interface FileViewerProps {
    message?: FileMessage | MultipleFilesMessage;
    statefulFileInfoList?: UploadedFileInfoWithUpload[];
    isByMe?: boolean;
    currentIndex?: number;
    onClose: (e: MouseEvent) => void;
    onDelete?: (e: MouseEvent) => void;
    onClickLeft?: () => void;
    onClickRight?: () => void;
    onDownloadClick?: (e: MouseEvent) => Promise<void>;
}
export default function FileViewer({ message, statefulFileInfoList, onClose, isByMe, onDelete, currentIndex, onClickLeft, onClickRight, onDownloadClick, }: FileViewerProps): ReactElement;
