import { Leader } from './Leader';
import { Follower } from './Follower';
import { GetQuery } from './queries';
import { PingResponse } from './types';

export class Tile38 extends Leader {
    private readonly follower?: Follower;

    constructor(
        url = process.env.TILE38_LEADER_URI || process.env.TILE38_URI,
        followerUrl = process.env.TILE38_FOLLOWER_URI
    ) {
        super(url as string);

        if (followerUrl) {
            this.follower = new Follower(followerUrl);
        }
    }

    get(key: string, id: string, forceLeader = false): GetQuery {
        return forceLeader || !this.follower
            ? super.get(key, id)
            : this.follower.get(key, id);
    }

    ping(forceLeader = false): Promise<PingResponse> {
        return forceLeader || !this.follower
            ? super.ping()
            : this.follower.ping();
    }

    async quit(): Promise<'OK'> {
        await Promise.all([super.quit(), this.follower?.quit()]);
        return 'OK';
    }
}
