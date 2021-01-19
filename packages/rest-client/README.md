# rest-client

A TypeScript rest api client based on [node-fetch](https://www.npmjs.com/package/node-fetch) with type assertion.

## Install

```shell
yarn add @vpriem/rest-client
```

## Basic usage

```typescript
import { RestClient } from '@vpriem/rest-client';

interface Payload {
    id: string;
}

const client = new RestClient('https://my.api');

await client.get<Payload>('/resource/{id}', { params: { id: 1 } });
```

This will perform a `GET https://my.api/resource/1` request.

## Advanced usage

You can define your own client by extending the `RestClient` class in order to map your resources with methods and return types:

```typescript
import { RestClient } from '@vpriem/rest-client';

interface BlogPost {
    id: string;
    title: string;
}

class BlogApi extends RestClient {
    async getPost(id: string): Promise<BlogPost> {
        return this.get<BlogPost>('/post/{id}', { params: { id } });
    }
}
```

Now you can instantiate a client and send requests:

```typescript
const blogApi = new BlogApi('https://blog.api');

await blogApi.getPost('859e3470-bcaa-499d-948f-0216e168e633');
```

This will perform a `GET https://blog.api/post/859e3470-bcaa-499d-948f-0216e168e633` request.

For a complete client example see [here](https://github.com/vpriem/ts-monorepo/tree/master/packages/rest-client/src/examples).

## API

```typescript
import { RestClient } from '@vpriem/rest-client';
```

### new RestClient(url: string, options?: Options): RestClient

Instantiate a rest client.

-   `url` the base url
-   `options?.headers` the default headers to send along with every request

### async RestClient.request<R = object>(path: string, options?: FetchOptions): Promise<R>

Perform a basic request.

-   `path` path of the endpoint e.g `/post/{id}`
-   `options?.headers` headers to send with the request, overriding default headers
-   `options?.params` path parameters to replace in the path
-   `options?.query` query object, will be encoded and appended to the url
-   `options?.body` body object, will be JSON encoded. A `Content-Type: application/json` header will be added to the request

### async RestClient.get<R = object>(path: string, options?: FetchOptions): Promise<R>

Perform a `GET` request.

### async RestClient.post<R = object>(path: string, options?: FetchOptions): Promise<R>

Perform a `POST` request.

### async RestClient.put<R = object>(path: string, options?: FetchOptions): Promise<R>

Perform a `PUT` request.

### async RestClient.delete<R = object>(path: string, options?: FetchOptions): Promise<R>

Perform a `DELETE` request.

### RequestError

The request error thrown for http status < 200 or ≥ 300.

-   `RequestError.message` http status text
-   `RequestError.status` http status code
-   `RequestError.response` node-fetch response

Helpful to handle 404 for example:

```typescript
class BlogApi extends RestClient {
    async getPost(id: string): Promise<BlogPost | null> {
        try {
            returnn await blogApi.getPost(id);
        } catch (error) {
            if (error instanceof RequestError && error.status === 404) {
                return null;
            }
            throw error;
        }
    }
}
```

## License

[MIT](LICENSE)
