import { SendableMessageType } from './index';
export declare const noop: () => void;
export declare const getSenderProfileUrl: (message: SendableMessageType) => string;
export declare const getSenderName: (message: SendableMessageType) => string;
export declare const isAboutSame: (a: number, b: number, px: number) => boolean;
export declare const deleteNullish: <T>(obj: T) => T;
export declare function openURL(url?: string | null): void;
type Falsy = undefined | null | false | 0 | '';
export declare function classnames(...args: (string | Falsy)[]): string;
declare const _default: {
    getSenderName: (message: SendableMessageType) => string;
    getSenderProfileUrl: (message: SendableMessageType) => string;
};
export default _default;
