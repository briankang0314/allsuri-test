import React from 'react';
import { StringSet } from '../ui/Label/stringSet';
import type { Locale } from 'date-fns';
declare const LocalizationContext: React.Context<{
    stringSet: StringSet;
    dateLocale: globalThis.Locale;
}>;
interface LocalizationProviderProps {
    stringSet: StringSet;
    dateLocale?: Locale;
    children: React.ReactElement;
}
declare const LocalizationProvider: (props: LocalizationProviderProps) => React.ReactElement;
declare const useLocalization: () => {
    stringSet: StringSet;
    dateLocale: globalThis.Locale;
};
export { LocalizationContext, LocalizationProvider, useLocalization };
