# express-api-key-auth

Tiny express middleware to authenticate `x-api-key` request header.

## Install

```shell
yarn add @vpriem/express-api-key-auth
```

## API

```typescript
import { apiKeyAuth } from '@vpriem/express-api-key-auth';
```

### apiKeyAuth(apiKeys: string[]): Handler

Create an express middleware with a given list of allowed api keys.  
Throwing `401` for all request with header `x-api-key` not matching the given list.

```typescript
import { apiKeyAuth } from '@vpriem/express-api-key-auth';

express().use(apiKeyAuth(['my-api-key1', 'my-api-key2']));
```

### apiKeyAuth(regExp: RegExp): Handler

Create the auth middleware based on all env vars with the name matching the given RegExp.

```typescript
import { apiKeyAuth } from '@vpriem/express-api-key-auth';

express().use(apiKeyAuth(/^API_KEY_/));
```

This will create a handler with a list of api keys matching all `process.env.API_KEY_*` env vars.

## License

[MIT](LICENSE)
