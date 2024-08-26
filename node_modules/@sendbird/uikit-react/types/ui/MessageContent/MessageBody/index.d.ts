import { ReactElement } from 'react';
import '../index.scss';
import { CoreMessageType } from '../../../utils';
import { SendBirdStateConfig } from '../../../lib/types';
import { Nullable } from '../../../types';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import type { OnBeforeDownloadFileMessageType } from '../../../modules/GroupChannel/context/GroupChannelProvider';
export type RenderedTemplateBodyType = 'failed' | 'composite' | 'simple';
export interface MessageBodyProps {
    channel: Nullable<GroupChannel>;
    message: CoreMessageType;
    showFileViewer?: (bool: boolean) => void;
    onTemplateMessageRenderedCallback?: (renderedTemplateBodyType: RenderedTemplateBodyType) => void;
    onMessageHeightChange?: () => void;
    onBeforeDownloadFileMessage?: OnBeforeDownloadFileMessageType;
    mouseHover: boolean;
    isMobile: boolean;
    config: SendBirdStateConfig;
    isReactionEnabledInChannel: boolean;
    isByMe: boolean;
}
export default function MessageBody(props: MessageBodyProps): ReactElement;
