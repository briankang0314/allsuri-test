import { ReactElement } from 'react';
import { MultipleFilesMessage } from '@sendbird/chat/message';
import type { OnBeforeDownloadFileMessageType } from '../../modules/GroupChannel/context/GroupChannelProvider';
import './index.scss';
import { UploadedFileInfoWithUpload } from '../../types';
export declare const ThreadMessageKind: {
    readonly PARENT: "parent";
    readonly CHILD: "child";
};
export type ThreadMessageKindType = typeof ThreadMessageKind[keyof typeof ThreadMessageKind];
interface Props {
    className?: string;
    message: MultipleFilesMessage;
    isByMe?: boolean;
    mouseHover?: boolean;
    isReactionEnabled?: boolean;
    truncateLimit?: number;
    threadMessageKindKey?: string;
    statefulFileInfoList?: UploadedFileInfoWithUpload[];
    onBeforeDownloadFileMessage?: OnBeforeDownloadFileMessageType;
}
export default function MultipleFilesMessageItemBody({ className, message, isReactionEnabled, threadMessageKindKey, statefulFileInfoList, onBeforeDownloadFileMessage, }: Props): ReactElement;
export {};
