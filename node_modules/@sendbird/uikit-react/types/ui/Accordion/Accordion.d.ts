import React, { type ReactElement } from 'react';
import './index.scss';
export interface AccordionProps {
    className?: string;
    id: string;
    renderTitle?: () => ReactElement;
    renderContent?: () => ReactElement;
    renderFooter?: () => ReactElement;
}
export declare const Accordion: ({ className, id, renderTitle, renderContent, renderFooter, }: AccordionProps) => React.JSX.Element;
