import type { GroupChannel } from '@sendbird/chat/groupChannel';
import type { OpenChannel } from '@sendbird/chat/openChannel';
export declare const DEFAULT_URL_PREFIX = "https://static.sendbird.com/sample/cover/cover_";
export declare const getOpenChannelAvatar: (channel?: OpenChannel | null) => string | undefined;
export declare const getChannelAvatarSource: (channel: GroupChannel | null, currentUserId: string) => string | Array<string>;
export declare const generateDefaultAvatar: (channel: GroupChannel | null) => boolean;
