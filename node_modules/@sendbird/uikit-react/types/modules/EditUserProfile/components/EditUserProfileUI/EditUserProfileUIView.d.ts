import React, { type MutableRefObject, type Dispatch } from 'react';
export interface EditUserProfileUIViewProps {
    formRef: MutableRefObject<any>;
    inputRef: MutableRefObject<any>;
    setProfileImage: Dispatch<File | null>;
    onThemeChange?: (theme: string) => void;
}
export declare const EditUserProfileUIView: ({ formRef, inputRef, onThemeChange, setProfileImage, }: EditUserProfileUIViewProps) => React.JSX.Element;
