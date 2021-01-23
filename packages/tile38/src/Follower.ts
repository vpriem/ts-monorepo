import { Client } from './Client';
import { GetQuery } from './queries';

export class Follower extends Client {
    get(key: string, id: string): GetQuery {
        return new GetQuery(this, key, id);
    }
}
