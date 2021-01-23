import { Leader } from './Leader';
import { Follower } from './Follower';
import { GetQuery } from './queries';

export class Tile38 extends Leader {
    private readonly follower: Follower;

    constructor(
        url = process.env.TILE38_LEADER_URI || process.env.TILE38_URI,
        followerUrl = process.env.TILE38_FOLLOWER_URI
    ) {
        super(url as string);

        if (followerUrl) {
            this.follower = new Follower(followerUrl);
        }
    }

    get(key: string, id: string): GetQuery {
        if (this.follower) {
            return this.follower.get(key, id);
        }

        return super.get(key, id);
    }

    async quit(): Promise<'OK'> {
        await Promise.all([super.quit(), this.follower?.quit()]);
        return 'OK';
    }
}
