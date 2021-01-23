import { createClient, RedisClient } from 'redis';
import { Command, CommandArgs, JSONResponse, ResponseFormat } from './types';
import {
    Tile38Error,
    Tile38IdNotFoundError,
    Tile38KeyNotFoundError,
} from './errors';

export abstract class Client {
    private redis: RedisClient;

    public url: string;

    private outputFormat: ResponseFormat = ResponseFormat.RESP;

    protected constructor(url: string) {
        this.redis = createClient(url);

        this.url = url;

        // In case of reconnect
        this.redis.on('connect', () => {
            this.outputFormat = ResponseFormat.RESP;
        });
    }

    private sendCommand(command: string, args?: CommandArgs): Promise<string> {
        return new Promise((resolve, reject) => {
            this.redis.sendCommand(command, args, (error, reply) =>
                error ? reject(error) : resolve(reply)
            );
        });
    }

    async command<R extends JSONResponse = JSONResponse>(
        command: Command,
        args?: CommandArgs
    ): Promise<R> {
        // Set default output format to JSON
        if (
            command !== Command.OUTPUT &&
            this.outputFormat !== ResponseFormat.JSON
        ) {
            await this.output(ResponseFormat.JSON);
        }

        const str = await this.sendCommand(command, args);

        let res: R;
        try {
            res = JSON.parse(str) as R;
        } catch (error) /* istanbul ignore next */ {
            throw new Tile38Error(
                `"${command}" command failed: "${
                    error instanceof Error ? error.message : 'unknown'
                }"`
            );
        }

        if (!res.ok) {
            const message = `"${command}" command failed: "${
                res.err || 'unknown'
            }"`;

            if (res.err?.includes('key not found')) {
                throw new Tile38KeyNotFoundError(message);
            }

            if (res.err?.includes('id not found')) {
                throw new Tile38IdNotFoundError(message);
            }

            throw new Tile38Error(message);
        }

        return res;
    }

    async output(format: ResponseFormat): Promise<void> {
        await this.command(Command.OUTPUT, [format]);
        this.outputFormat = format;
    }

    quit(): Promise<'OK'> {
        return new Promise((resolve, reject) => {
            this.redis.quit((error, reply) =>
                error ? reject(error) : resolve(reply)
            );
        });
    }
}
