import { DependencyList } from 'react';
/**
 * You can pass the resolve function to scrollPubSub, if you want to catch when the scroll is finished.
 * */
type PromiseResolver = () => void;
export type ScrollTopics = 'scrollToBottom' | 'scroll';
export type ScrollTopicUnion = {
    topic: 'scrollToBottom';
    payload: {
        animated?: boolean;
        resolve?: PromiseResolver;
    };
} | {
    topic: 'scroll';
    payload: {
        top?: number;
        animated?: boolean;
        lazy?: boolean;
        resolve?: PromiseResolver;
    };
};
export declare function useMessageListScroll(behavior: 'smooth' | 'auto', deps?: DependencyList): {
    scrollRef: import("react").MutableRefObject<HTMLDivElement>;
    scrollPubSub: import("../../../../lib/pubSub").PubSubTypes<ScrollTopics, ScrollTopicUnion>;
    isScrollBottomReached: boolean;
    setIsScrollBottomReached: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    scrollDistanceFromBottomRef: import("react").MutableRefObject<number>;
    scrollPositionRef: import("react").MutableRefObject<number>;
};
export {};
