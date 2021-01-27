import { Client } from './Client';
import { GetQuery } from './queries';
import { Command, PingResponse } from './types';

export class Follower extends Client {
    get(key: string, id: string): GetQuery {
        return new GetQuery(this, key, id);
    }

    ping(): Promise<PingResponse> {
        return this.command(Command.PING);
    }
}
