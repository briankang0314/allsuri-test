import React, { type ReactElement } from 'react';
export interface AccordionGroupContextType {
    openedListKeys: Array<string>;
    addOpenedListKey: (key: string) => void;
    removeOpenedListKey: (key: string) => void;
    clearOpenedListKeys: () => void;
    allowMultipleOpen: boolean;
}
export declare const AccordionGroupContext: React.Context<AccordionGroupContextType>;
export interface AccordionGroupProps {
    className?: string;
    children: ReactElement | Array<ReactElement>;
    allowMultipleOpen?: boolean;
}
export declare const AccordionGroupProvider: ({ className, children, allowMultipleOpen, }: AccordionGroupProps) => React.JSX.Element;
export declare const useAccordionGroupContext: () => AccordionGroupContextType;
export default AccordionGroupProvider;
