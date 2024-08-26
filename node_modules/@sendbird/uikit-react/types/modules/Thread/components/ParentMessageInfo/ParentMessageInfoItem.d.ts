import { ReactElement } from 'react';
import './ParentMessageInfoItem.scss';
import { SendableMessageType } from '../../../../utils';
import type { OnBeforeDownloadFileMessageType } from '../../../GroupChannel/context/GroupChannelProvider';
export interface ParentMessageInfoItemProps {
    className?: string;
    message: SendableMessageType;
    showFileViewer?: (bool: boolean) => void;
    onBeforeDownloadFileMessage?: OnBeforeDownloadFileMessageType;
}
export default function ParentMessageInfoItem({ className, message, showFileViewer, onBeforeDownloadFileMessage, }: ParentMessageInfoItemProps): ReactElement;
