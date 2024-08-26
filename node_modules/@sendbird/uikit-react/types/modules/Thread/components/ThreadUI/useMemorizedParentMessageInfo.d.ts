import React, { ReactNode } from 'react';
import { ParentMessageStateTypes } from '../../types';
import { SendableMessageType } from '../../../../utils';
export interface UseMemorizedParentMessageInfoProps {
    parentMessage: SendableMessageType;
    parentMessageState: ParentMessageStateTypes;
    renderParentMessageInfo?: () => ReactNode;
    renderParentMessageInfoPlaceholder?: (type: ParentMessageStateTypes) => ReactNode;
}
declare const useMemorizedParentMessageInfo: ({ parentMessage, parentMessageState, renderParentMessageInfo, renderParentMessageInfoPlaceholder, }: UseMemorizedParentMessageInfoProps) => string | number | boolean | React.JSX.Element | Iterable<React.ReactNode>;
export default useMemorizedParentMessageInfo;
