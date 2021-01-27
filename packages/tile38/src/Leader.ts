import { Follower } from './Follower';
import { SetQuery } from './queries';
import { Command, JSONResponse } from './types';

export class Leader extends Follower {
    del(key: string, id: string): Promise<JSONResponse> {
        return this.command(Command.DEL, [key, id]);
    }

    drop(key: string): Promise<JSONResponse> {
        return this.command(Command.DROP, [key]);
    }

    expire(key: string, id: string, seconds: number): Promise<JSONResponse> {
        return this.command(Command.EXPIRE, [key, id, seconds]);
    }

    set(key: string, id: string): SetQuery {
        return new SetQuery(this, key, id);
    }
}
