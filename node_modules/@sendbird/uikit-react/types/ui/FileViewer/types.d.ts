import { MouseEvent } from 'react';
export declare const ViewerTypes: {
    readonly SINGLE: "SINGLE";
    readonly MULTI: "MULTI";
};
export type ViewerType = keyof typeof ViewerTypes;
export interface SenderInfo {
    profileUrl: string;
    nickname: string;
}
export interface FileInfo {
    name: string;
    type: string;
    url: string;
}
export interface BaseViewer {
    onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
}
export interface SingleFileViewer extends SenderInfo, FileInfo, BaseViewer {
    viewerType?: typeof ViewerTypes.SINGLE;
    isByMe?: boolean;
    disableDelete?: boolean;
    onDelete: (e: MouseEvent) => void;
    onDownloadClick?: (e: MouseEvent) => Promise<void>;
}
export interface MultiFilesViewer extends SenderInfo, BaseViewer {
    viewerType: typeof ViewerTypes.MULTI;
    fileInfoList: FileInfo[];
    currentIndex: number;
    onClickLeft: () => void;
    onClickRight: () => void;
    onDownloadClick?: (e: MouseEvent) => Promise<void>;
}
export type FileViewerComponentProps = SingleFileViewer | MultiFilesViewer;
