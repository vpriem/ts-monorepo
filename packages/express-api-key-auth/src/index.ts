import type { Request, Response, NextFunction, Handler } from 'express';
import createError from 'http-errors';
import { loadApiKeys } from './utils';

const createMiddleware = (apiKeys: string[]): Handler => (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const apiKey = req.header('x-api-key');
    return next(
        apiKey && apiKeys.includes(apiKey) ? undefined : createError(401)
    );
};

type ApiKeyAuth = {
    (apiKeys: string[]): Handler;
    (regExp: RegExp): Handler;
};

export const apiKeyAuth: ApiKeyAuth = (
    apiKeysOrRegexp: string[] | RegExp
): Handler =>
    createMiddleware(
        Array.isArray(apiKeysOrRegexp)
            ? apiKeysOrRegexp
            : loadApiKeys(apiKeysOrRegexp)
    );
