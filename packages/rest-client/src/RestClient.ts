import fetch from 'node-fetch';
import queryString from 'querystring';
import { RequestOptions, Options } from './types';
import { createPath, isJSON } from './utils';
import { RequestError } from './RequestError';

export class RestClient {
    private readonly url: string;

    private readonly options?: Options;

    constructor(url: string, options?: Options) {
        this.url = url;

        this.options = options;
    }

    async request<R extends object | null = object>(
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
            Accept: 'application/json',
            ...this.options?.headers,
            ...(body && {
                'Content-Type': 'application/json',
            }),
            ...options?.headers,
        };

        const response = await fetch(`${this.url}${p}${qs}`, {
            ...this.options,
            method: 'GET',
            ...options,
            headers,
            body,
        });

        let content: R | null = null;

        const contentType = response.headers.get('content-type');
        if (contentType && isJSON(contentType.toLowerCase())) {
            content = (await response.json()) as R;
        }

        if (response.ok) {
            return content as R;
        }

        throw new RequestError(response.statusText, response, content);
    }

    async get<R extends object | null = object>(
        path: string,
        options?: RequestOptions
    ): Promise<R> {
        return this.request<R>(path, options);
    }

    async post<R extends object | null = object>(
        path: string,
        options?: RequestOptions
    ): Promise<R> {
        return this.request<R>(path, {
            ...options,
            method: 'POST',
        });
    }

    async put<R extends object | null = object>(
        path: string,
        options?: RequestOptions
    ): Promise<R> {
        return this.request<R>(path, {
            ...options,
            method: 'PUT',
        });
    }

    async delete<R extends object | null = object>(
        path: string,
        options?: RequestOptions
    ): Promise<R> {
        return this.request<R>(path, {
            ...options,
            method: 'DELETE',
        });
    }
}
