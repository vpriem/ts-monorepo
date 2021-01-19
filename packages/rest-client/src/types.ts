import { RequestInit } from 'node-fetch';
import { ParsedUrlQueryInput } from 'querystring';

export type Headers = Record<string, string>;

export type Params = Record<string, string | number>;

export interface Options {
    headers?: Headers;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
    headers?: Headers;
    params?: Params;
    query?: ParsedUrlQueryInput;
    body?: object;
}
