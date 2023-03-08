import { Params } from './types';

export const createPath = (path: string, params?: Params): string =>
    params
        ? Object.entries(params).reduce(
              (acc, [name, value]) =>
                  acc.replace(`{${name}}`, encodeURIComponent(value)),
              path
          )
        : path;

export const isJSON = (contentType: string): boolean =>
    contentType.startsWith('application/json') ||
    contentType.startsWith('application/geo+json') ||
    contentType.startsWith('application/vnd.geo+json');
