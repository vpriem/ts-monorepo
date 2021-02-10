import { Params } from './types';

export const createPath = (path: string, params?: Params): string =>
    params
        ? Object.keys(params).reduce(
              (p, name) =>
                  p.replace(`{${name}}`, encodeURIComponent(params[name])),
              path
          )
        : path;

export const isJSON = (contentType: string): boolean =>
    contentType.startsWith('application/json') ||
    contentType.startsWith('application/geo+json');
