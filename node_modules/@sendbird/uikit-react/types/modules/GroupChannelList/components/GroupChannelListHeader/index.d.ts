import React from 'react';
import './index.scss';
import { HeaderCustomProps } from '../../../../ui/Header';
export interface GroupChannelListHeaderProps extends HeaderCustomProps {
    /** @deprecated Use the props `renderMiddle` instead */
    renderTitle?: () => React.ReactElement;
    renderIconButton?: (props: void) => React.ReactElement;
    onEdit?: (props: void) => void;
    allowProfileEdit?: boolean;
}
export declare const GroupChannelListHeader: ({ renderTitle, renderIconButton, onEdit, allowProfileEdit, renderLeft, renderMiddle, renderRight, }: GroupChannelListHeaderProps) => React.JSX.Element;
export default GroupChannelListHeader;
