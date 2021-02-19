import { Client } from './Client';
import { GetQuery, WithinQuery } from './queries';
import { Command, PingResponse } from './types';

export class Follower extends Client {
    get(key: string, id: string): GetQuery {
        return new GetQuery(this, key, id);
    }

    within(key: string): WithinQuery {
        return new WithinQuery(this, key);
    }

    ping(): Promise<PingResponse> {
        return this.command(Command.PING);
    }
}
