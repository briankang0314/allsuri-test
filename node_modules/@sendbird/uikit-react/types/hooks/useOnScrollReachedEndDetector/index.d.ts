import React from 'react';
type onPositionEvent = {
    distanceFromBottom: number;
};
export interface UseOnScrollReachedEndDetectorParams {
    onReachedTop?: (event: onPositionEvent) => void;
    onReachedBottom?: (event: onPositionEvent) => void;
    onInBetween?: (event: onPositionEvent) => void;
}
export declare function useOnScrollPositionChangeDetector(params: UseOnScrollReachedEndDetectorParams): (event: React.UIEvent<HTMLDivElement, UIEvent>) => void;
export {};
