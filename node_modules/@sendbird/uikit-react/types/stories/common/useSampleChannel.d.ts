import { GroupChannel } from "@sendbird/chat/groupChannel";
type UseSampleChannelParams = {
    appId?: string;
    userId?: string;
};
export declare const useSampleChannel: ({ appId, userId, }?: UseSampleChannelParams) => GroupChannel | null;
export {};
