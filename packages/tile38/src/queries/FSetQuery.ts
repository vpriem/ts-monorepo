import { Query } from './Query';
import { Command, Fields, SubCommands } from '../types';
import { Client } from '../Client';

export class FSetQuery extends Query {
    constructor(client: Client, key: string, id: string, fields: Fields) {
        super(client);

        this.command = Command.FSET;

        this.key(key).id(id).fields(fields);
    }

    key(value: string): this {
        this.args[0] = value;
        return this;
    }

    id(value: string): this {
        this.args[1] = value;
        return this;
    }

    xx(flag = true): this {
        if (flag) {
            this.args[2] = SubCommands.XX;
        } else {
            delete this.args[2];
        }
        return this;
    }

    fields(fields: Fields): this {
        this.args[3] = Object.keys(fields).map((name) => [name, fields[name]]);

        return this;
    }
}
