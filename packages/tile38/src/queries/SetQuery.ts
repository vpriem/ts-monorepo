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

    field(name: string, value: number): this {
        this.args[2] = [SubCommands.FIELD, name, value];
        return this;
    }

    fields(fields: Fields): this {
        this.args[2] = Object.keys(fields).map((name) => [
            SubCommands.FIELD,
            name,
            fields[name],
        ]);
        return this;
    }

    ex(seconds: number): this {
        this.args[3] = [SubCommands.EX, seconds];
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
}
