interface DynamicSideLengthProps {
    width: string | number | null;
    height: string | number | null;
    maxSideLength: string | null;
    defaultMinLength: string;
}
export declare function useDynamicSideLength({ width, height, maxSideLength, defaultMinLength, }: DynamicSideLengthProps): string[];
export {};
