import type { GroupChannel } from '@sendbird/chat/groupChannel';
declare function useReconnectOnIdle(isOnline: boolean, currentGroupChannel: GroupChannel | null, reconnectOnIdle?: boolean): {
    shouldReconnect: boolean;
};
export default useReconnectOnIdle;
