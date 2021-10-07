import fetch from 'node-fetch';
import queryString from 'querystring';
import { RequestOptions, Headers, Options } from './types';
import { createPath, isJSON } from './utils';
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
            ...this.headers,
            ...(body && {
                'Content-Type': 'application/json',
            }),
            ...options?.headers,
        };

        const response = await fetch(`${this.url}${p}${qs}`, {
            method: 'GET',
            ...options,
            headers,
            body,
        });

        let responseBody: R | undefined;

        const contentType = response.headers.get('content-type');
        if (contentType && isJSON(contentType.toLowerCase())) {
            responseBody = (await response.json()) as R;
        }

        if (response.ok) {
            if (responseBody) return responseBody;

            throw new RequestError('Empty Response', response, responseBody);
        }

        throw new RequestError(response.statusText, response, responseBody);
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
        return this.request<R>(path, { ...options, method: 'PUT' });
    }

    async delete<R extends object | null = object>(
        path: string,
        options?: RequestOptions
    ): Promise<R | null> {
        try {
            return await this.request<R>(path, {
                ...options,
                method: 'DELETE',
            });
        } catch (error) {
            if (error instanceof RequestError && error.statusCode === 200) {
                return null;
            }
            throw error;
        }
    }
}
