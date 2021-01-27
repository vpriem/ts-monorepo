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

export interface JSONResponse {
    ok: boolean;
    elapsed: string;
    err?: string;
}

export interface ObjectResponse<O = object, F = Fields> extends JSONResponse {
    object: O;
    fields?: F;
}

export interface PointResponse<F = Fields> extends JSONResponse {
    point: {
        lat: number;
        lon: number;
    };
    fields?: F;
}

export interface HashResponse<F = Fields> extends JSONResponse {
    hash: string;
    fields?: F;
}

export interface PingResponse extends JSONResponse {
    ping: 'pong';
}
