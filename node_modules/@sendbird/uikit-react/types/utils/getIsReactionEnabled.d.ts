/**
 * This function helps consider the every condition
 * related to enabling emoji reaction feature.
 */
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import type { SendBirdStateConfig } from '../lib/types';
export interface IsReactionEnabledProps {
    channel: GroupChannel | null;
    config: SendBirdStateConfig;
    moduleLevel?: boolean;
}
export declare function getIsReactionEnabled({ channel, config, moduleLevel, }: IsReactionEnabledProps): boolean;
