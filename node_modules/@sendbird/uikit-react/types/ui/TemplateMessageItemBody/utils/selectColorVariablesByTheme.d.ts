import { SendbirdTheme } from '../../../types';
export declare function convertArgbToRgba(string: string): string;
export default function selectColorVariablesByTheme({ colorVariables, theme }: {
    colorVariables: Record<string, unknown>;
    theme: SendbirdTheme;
}): Record<string, unknown>;
