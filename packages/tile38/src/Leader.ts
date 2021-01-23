import { Follower } from './Follower';
import { SetQuery } from './queries';

export class Leader extends Follower {
    set(key: string, id: string): SetQuery {
        return new SetQuery(this, key, id);
    }
}
