import { Query } from './Query';
import {
    Command,
    Fields,
    HashResponse,
    ObjectResponse,
    Output,
    PointResponse,
    SubCommands,
} from '../types';
import { Client } from '../Client';

export class GetQuery extends Query<ObjectResponse> {
    constructor(client: Client, key: string, id: string) {
        super(client);

        this.command = Command.GET;

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

    withFields(flag = true): this {
        if (flag) {
            this.args[2] = SubCommands.WITHFIELDS;
        } else {
            delete this.args[2];
        }
        return this;
    }

    private output(format: Output.OBJECT | Output.POINT | Output.BOUNDS): this;

    private output(format: Output.HASH, precision: number): this;

    private output(
        format: Output.OBJECT | Output.POINT | Output.BOUNDS | Output.HASH,
        precision?: number
    ): this {
        if (format === Output.OBJECT) {
            delete this.args[3];
        } else if (format === Output.HASH) {
            this.args[3] = [format, precision as number];
        } else {
            this.args[3] = format;
        }

        return this;
    }

    toObject<O = object, F = Fields>(): Promise<ObjectResponse<O, F>> {
        this.output(Output.OBJECT);
        return this.exec();
    }

    toPoint<F = Fields>(): Promise<PointResponse<F>> {
        this.output(Output.POINT);
        return this.exec<PointResponse<F>>();
    }

    toHash<F = Fields>(precision: number): Promise<HashResponse<F>> {
        this.output(Output.HASH, precision);
        return this.exec<HashResponse<F>>();
    }
}
