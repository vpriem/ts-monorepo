// eslint-disable-next-line import/no-unresolved
import type { Request, Response, NextFunction, Handler } from 'express';
import createError from 'http-errors';
import { loadApiKeys } from './utils';

const createMiddleware =
    (apiKeys: string[]): Handler =>
    (req: Request, res: Response, next: NextFunction): void => {
        const apiKey = req.header('x-api-key');
        return next(
            apiKey && apiKeys.includes(apiKey) ? undefined : createError(401)
        );
    };

export function apiKeyAuth(apiKeys: string[]): Handler;

export function apiKeyAuth(regExp: RegExp): Handler;

export function apiKeyAuth(apiKeysOrRegexp: string[] | RegExp): Handler {
    return createMiddleware(
        Array.isArray(apiKeysOrRegexp)
            ? apiKeysOrRegexp
            : loadApiKeys(apiKeysOrRegexp)
    );
}
