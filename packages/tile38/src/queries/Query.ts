import { Command, CommandArgs, JSONResponse } from '../types';
import { Client } from '../Client';

export abstract class Query<R extends JSONResponse = JSONResponse> {
    private readonly client: Client;

    protected command: Command;

    protected args: CommandArgs | CommandArgs[] | CommandArgs[][] = [];

    protected constructor(client: Client) {
        this.client = client;
    }

    async exec<OverrideR>(): Promise<OverrideR>;

    async exec(): Promise<R> {
        return this.client.command<R>(this.command, this.args.flat().flat());
    }
}
