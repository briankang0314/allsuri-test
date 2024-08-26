import { ReactElement } from 'react';
import './index.scss';
export declare function getBorderRadiusForImageRenderer(circle?: boolean, borderRadius?: string | number | null): string | undefined;
export declare function getBorderRadiusForMultipleImageRenderer(borderRadius: string | number, index: number, totalCount: number): string;
export interface ImageRendererProps {
    className?: string | Array<string>;
    url: string;
    alt?: string;
    width?: string | number | null;
    maxSideLength?: string | null;
    height?: string | number | null;
    circle?: boolean;
    fixedSize?: boolean;
    placeHolder?: ((props: {
        style: Record<string, string | number>;
    }) => ReactElement) | ReactElement | null;
    defaultComponent?: (() => ReactElement) | ReactElement | null;
    borderRadius?: string | number | null;
    onLoad?: () => void;
    onError?: () => void;
    shadeOnHover?: boolean;
    isUploaded?: boolean;
}
declare const ImageRenderer: ({ className, url, alt, width, maxSideLength, height, circle, fixedSize, placeHolder, defaultComponent, borderRadius, onLoad, onError, shadeOnHover, isUploaded, }: ImageRendererProps) => ReactElement;
export default ImageRenderer;
