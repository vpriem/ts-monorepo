import { Query } from './Query';
import {
    Output,
    Command,
    ObjectsResponse,
    CountResponse,
    IdsResponse,
} from '../types';
import { Client } from '../Client';

export class WithinQuery extends Query<ObjectsResponse> {
    constructor(client: Client, key: string) {
        super(client);

        this.command = Command.WITHIN;

        this.key(key);
    }

    key(value: string): this {
        this.args[0] = value;
        return this;
    }

    radius(lat: number, lon: number, radius: number): this {
        this.args[2] = 'CIRCLE';
        this.args[3] = lat;
        this.args[4] = lon;
        this.args[5] = radius;

        return this;
    }

    private output(format: Output.OBJECTS | Output.COUNT | Output.IDS): this {
        if (format === Output.OBJECTS) {
            delete this.args[1];
        } else {
            this.args[1] = format;
        }

        return this;
    }

    asObjects<O = object>(): Promise<ObjectsResponse<O>> {
        this.output(Output.OBJECTS);
        return this.exec();
    }

    asCount(): Promise<CountResponse> {
        this.output(Output.COUNT);
        return this.exec<CountResponse>();
    }

    asIds(): Promise<IdsResponse> {
        this.output(Output.IDS);
        return this.exec<IdsResponse>();
    }
}
