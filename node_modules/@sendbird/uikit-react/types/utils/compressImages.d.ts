import type { ImageCompressionOptions, ImageCompressionOutputFormatType } from '../lib/Sendbird';
import { Logger } from '../lib/SendbirdState';
interface CompressImageParams {
    imageFile: File;
    compressionRate: number;
    outputFormat: ImageCompressionOutputFormatType;
    resizingWidth?: number;
    resizingHeight?: number;
}
export declare const compressImage: ({ imageFile, compressionRate, resizingWidth, resizingHeight, outputFormat, }: CompressImageParams) => Promise<File>;
export interface CompressImagesParams {
    files: File[];
    imageCompression: ImageCompressionOptions;
    logger?: Logger;
}
export declare const compressImages: ({ files, logger, imageCompression, }: CompressImagesParams) => Promise<{
    failedIndexes: number[];
    compressedFiles: File[];
}>;
export {};
