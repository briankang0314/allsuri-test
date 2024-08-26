export type GroupKey = string;
export declare const generateGroupKey: (channelUrl?: string, key?: string) => GroupKey;
/**
 * Parses and returns the correct MIME type based on the browser.
 * If the browser is Safari and the file type is m4a, use 'audio/x-m4a' for the audio player.
 * Safari doesn't support 'audio/mp3' well.
 * Also, 'audio/m4a' should be converted to 'audio/x-m4a' to be correctly played in Safari.
 * @link: https://sendbird.atlassian.net/browse/CLNP-2997
 *
 * @param mimeType - The original MIME type.
 * @returns Converted file name and MIME type.
 */
export declare const getParsedVoiceAudioFileInfo: (mimeType: string) => {
    name: string;
    mimeType: string;
};
