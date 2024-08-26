import React from 'react';
import type { SendBirdState } from './types';
type ContextAwareComponentType = {
    (props: any): JSX.Element;
    displayName: string;
};
export declare const SendbirdSdkContext: React.Context<SendBirdState>;
/**
 * @deprecated This function is deprecated. Use `useSendbirdStateContext` instead.
 * */
declare const withSendbirdContext: (OriginalComponent: any, mapStoreToProps: Record<string, any>) => ContextAwareComponentType;
export default withSendbirdContext;
