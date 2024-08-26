declare function encodeMp3(arrayBuffer: ArrayBuffer): Int8Array[];
declare function downsampleToWav(file: File, callback: (buffer: ArrayBuffer) => void): void;
export interface WebAudioUtils {
    downsampleToWav: typeof downsampleToWav;
    encodeMp3: typeof encodeMp3;
}
export { downsampleToWav, encodeMp3 };
