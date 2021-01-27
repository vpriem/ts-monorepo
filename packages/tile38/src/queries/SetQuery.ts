import { Query } from './Query';
import { Command, Fields, Output, SubCommands } from '../types';
import { Client } from '../Client';

export class SetQuery extends Query {
    constructor(client: Client, key: string, id: string) {
        super(client);

        this.command = Command.SET;

        this.key(key).id(id);
    }

    key(value: string): this {
        this.args[0] = value;
        return this;
    }

    id(value: string): this {
        this.args[1] = value;
        return this;
    }

    fields(fields?: Fields): this {
        if (typeof fields === 'undefined') {
            delete this.args[2];
        } else {
            this.args[2] = Object.keys(fields).map((name) => [
                SubCommands.FIELD,
                name,
                fields[name],
            ]);
        }

        return this;
    }

    ex(seconds?: number): this {
        if (typeof seconds === 'undefined') {
            delete this.args[3];
        } else {
            this.args[3] = [SubCommands.EX, seconds];
        }
        return this;
    }

    nx(flag = true): this {
        if (flag) {
            this.args[4] = SubCommands.NX;
        } else {
            delete this.args[4];
        }
        return this;
    }

    xx(flag = true): this {
        if (flag) {
            this.args[4] = SubCommands.XX;
        } else {
            delete this.args[4];
        }
        return this;
    }

    point(lat: number, lon: number): this {
        this.args[5] = [Output.POINT, lat, lon];
        return this;
    }

    object<O = object>(geoJSON: O): this {
        this.args[5] = [Output.OBJECT, JSON.stringify(geoJSON)];
        return this;
    }

    hash(hash: string): this {
        this.args[5] = [Output.HASH, hash];
        return this;
    }
}