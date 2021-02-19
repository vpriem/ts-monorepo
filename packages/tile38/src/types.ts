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
    WITHIN = 'WITHIN',
}

export type CommandArgs = Array<string | number>;

export enum SubCommands {
    FIELD = 'FIELD',
    EX = 'EX',
    NX = 'NX',
    XX = 'XX',
    WITHFIELDS = 'WITHFIELDS',
    COUNT = 'COUNT',
    IDS = 'IDS',
}

export type Fields = Record<string, number>;

export enum Output {
    OBJECT = 'OBJECT',
    OBJECTS = 'OBJECTS',
    POINT = 'POINT',
    BOUNDS = 'BOUNDS',
    HASH = 'HASH',
    IDS = 'IDS',
    COUNT = 'COUNT',
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

export type ObjectsResponse<O = object> = JSONResponse<{
    objects: O[];
    count: number;
    cursor: number;
    fields?: string[];
}>;

export type IdsResponse = JSONResponse<{
    ids: string[];
    count: number;
    cursor: number;
}>;

export type CountResponse = JSONResponse<{
    count: number;
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
