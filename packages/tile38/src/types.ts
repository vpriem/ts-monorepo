export enum Command {
    DEL = 'DEL',
    PDEL = 'PDEL',
    DROP = 'DROP',
    EXPIRE = 'EXPIRE',
    SET = 'SET',
    FSET = 'FSET',
    GET = 'GET',
    OUTPUT = 'OUTPUT',
    PING = 'PING',
    FLUSHDB = 'FLUSHDB',
}

export type CommandArgs = Array<string | number>;

export enum SubCommands {
    FIELD = 'FIELD',
    EX = 'EX',
    NX = 'NX',
    XX = 'XX',
    WITHFIELDS = 'WITHFIELDS',
}

export type Fields = Record<string, number>;

export enum Output {
    OBJECT = 'OBJECT',
    POINT = 'POINT',
    BOUNDS = 'BOUNDS',
    HASH = 'HASH',
}

export enum ResponseFormat {
    RESP = 'resp',
    JSON = 'json',
}

export type JSONResponse<E extends object = {}> = {
    ok: boolean;
    elapsed: string;
    err?: string;
} & E;

export type ObjectResponse<O = object, F = Fields> = JSONResponse<{
    object: O;
    fields?: F;
}>;

export type PointResponse<F = Fields> = JSONResponse<{
    point: {
        lat: number;
        lon: number;
    };
    fields?: F;
}>;

export type HashResponse<F = Fields> = JSONResponse<{
    hash: string;
    fields?: F;
}>;

export type PingResponse = JSONResponse<{
    ping: 'pong';
}>;
