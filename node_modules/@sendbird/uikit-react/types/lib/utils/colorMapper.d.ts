export type ColorSet = Record<string, string>;
/**
 * Converts descriptive color keys to their numeric equivalents.
 *
 * This function takes a set of CSS variable keys and transforms
 * descriptive color keys (e.g. 'extra-light', 'main') into their
 * numeric equivalents(e.g. 100, 200, ..., 500) as defined in the colorMapping object.
 *
 * e.g.
 * Input:
 * {
 *   '--sendbird-light-primary-extra-dark': '#00487c',
 *   '--sendbird-light-primary-dark': '#4bb3fd',
 *   '--sendbird-light-primary-main': '#3e6680',
 *   '--sendbird-light-primary-light': '#0496ff',
 *   '--sendbird-light-primary-extra-light': '#027bce',
 * }
 *
 * Output:
 * {
 *   '--sendbird-light-primary-500': '#00487c',
 *   '--sendbird-light-primary-400': '#4bb3fd',
 *   '--sendbird-light-primary-300': '#3e6680',
 *   '--sendbird-light-primary-200': '#0496ff',
 *   '--sendbird-light-primary-100': '#027bce',
 * }
 *
 * @param {ColorSet} colorSet - The input object containing CSS variables with descriptive keys.
 * @returns {ColorSet} The transformed object with numeric keys.
 */
export declare const mapColorKeys: (colorSet: ColorSet) => ColorSet;
