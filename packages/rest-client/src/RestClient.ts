import fetch from 'node-fetch';
import queryString from 'querystring';
import { RequestOptions, Headers, Options } from './types';
import { createPath } from './utils';
import { RequestError } from './RequestError';

export class RestClient {
    private readonly url: string;

    private readonly headers: Headers;

    constructor(url: string, options?: Options) {
        this.url = url;

        this.headers = {
            Accept: 'application/json',
            ...options?.headers,
        };
    }

    async request<R = object>(
        path: string,
        options?: RequestOptions
    ): Promise<R> {
        const p = createPath(path, options?.params);

        const qs = options?.query
            ? `?${queryString.stringify(options.query)}`
            : '';

        const body =
            typeof options?.body === 'object'
                ? JSON.stringify(options.body)
                : undefined;

        const headers = {
            ...this.headers,
            ...(body && {
                'Content-Type': 'application/json',
            }),
            ...options?.headers,
        };

        const res = await fetch(`${this.url}${p}${qs}`, {
            method: 'GET',
            ...options,
            headers,
            body,
        });

        if (res.ok) {
            const contentType = res.headers.get('content-type');
            if (
                contentType &&
                ['application/json', 'application/geo+json'].includes(
                    contentType
                )
            ) {
                return res.json() as Promise<R>;
            }

            throw new RequestError('Empty Response', res);
        }

        throw new RequestError(res.statusText, res);
    }

    async get<R = object>(path: string, options?: RequestOptions): Promise<R> {
        return this.request<R>(path, options);
    }

    async post<R = object>(path: string, options?: RequestOptions): Promise<R> {
        return this.request<R>(path, {
            ...options,
            method: 'POST',
        });
    }

    async put<R = object>(path: string, options?: RequestOptions): Promise<R> {
        return this.request<R>(path, { ...options, method: 'PUT' });
    }

    async delete<R = object>(
        path: string,
        options?: RequestOptions
    ): Promise<R | null> {
        try {
            return await this.request<R>(path, {
                ...options,
                method: 'DELETE',
            });
        } catch (error) {
            if (error instanceof RequestError && error.status === 200) {
                return null;
            }
            throw error;
        }
    }
}
