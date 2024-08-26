import type { UserListItemMenuContextValues } from './context';
export declare const useToggleOperator: ({ channel, user, onToggleOperatorState, isOperator: _isOperator, }: UserListItemMenuContextValues & {
    isOperator?: boolean;
}) => {
    isOperator: boolean;
    toggleOperator: () => Promise<void>;
};
export declare const useToggleMute: ({ channel, user, onToggleMuteState, isMuted: _isMuted, }: UserListItemMenuContextValues & {
    isMuted?: boolean;
}) => {
    isMuted: boolean;
    toggleMute: () => Promise<void>;
};
export declare const useToggleBan: ({ channel, user, onToggleBanState, isBanned: _isBanned, }: UserListItemMenuContextValues & {
    isBanned?: boolean;
}) => {
    isBanned: boolean;
    toggleBan: () => Promise<void>;
};
