# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.4.0](https://github.com/vpriem/ts-monorepo/compare/@vpriem/rest-client@1.3.0...@vpriem/rest-client@1.4.0) (2023-10-01)

### Bug Fixes

-   **rest-client:** update node-fetch to v2.7.0 ([f3fcbcf](https://github.com/vpriem/ts-monorepo/commit/f3fcbcf5da62d73a99f056d12ce65f6b72d82453))

### Features

-   drop node 16 support ([361fb5f](https://github.com/vpriem/ts-monorepo/commit/361fb5f945d46f3cc0b67c5a6ff2117b5bd033ee))

# [1.3.0](https://github.com/vpriem/ts-monorepo/compare/@vpriem/rest-client@1.2.1...@vpriem/rest-client@1.3.0) (2023-07-03)

### Bug Fixes

-   **rest-client:** update node-fetch to v2.6.12 ([d529a88](https://github.com/vpriem/ts-monorepo/commit/d529a88a901f96c58c453f1dfa71b51c8482b622))

### Features

-   drop node 14 support ([9c111c9](https://github.com/vpriem/ts-monorepo/commit/9c111c95f2dfb0cb64b32fa07cc4cc905f6ceb4b))

## [1.2.1](https://github.com/vpriem/ts-monorepo/compare/@vpriem/rest-client@1.2.0...@vpriem/rest-client@1.2.1) (2023-03-08)

### Bug Fixes

-   **rest-client:** support application/vnd.geo+json header ([5bff458](https://github.com/vpriem/ts-monorepo/commit/5bff4584404b937e3206eeaad06682c5a685dde5))
-   **rest-client:** update node-fetch to v2.6.9 ([42ba9df](https://github.com/vpriem/ts-monorepo/commit/42ba9df2e1373aba0638a72ec62fc5fbf08ddd0f))

# [1.2.0](https://github.com/vpriem/ts-monorepo/compare/@vpriem/rest-client@1.1.3...@vpriem/rest-client@1.2.0) (2022-12-26)

### Features

-   drop node 12 support ([8028e77](https://github.com/vpriem/ts-monorepo/commit/8028e7777d9e55f835592267f317a80c55a306a1))

## [1.1.3](https://github.com/vpriem/ts-monorepo/compare/@vpriem/rest-client@1.1.2...@vpriem/rest-client@1.1.3) (2022-06-17)

### Bug Fixes

-   **rest-client:** update @types/node-fetch to v2.6.2 ([0bfad06](https://github.com/vpriem/ts-monorepo/commit/0bfad06752b3414901c1f5219679c9559a8aff8a))

## [1.1.2](https://github.com/vpriem/ts-monorepo/compare/@vpriem/rest-client@1.1.1...@vpriem/rest-client@1.1.2) (2022-01-31)

### Bug Fixes

-   **rest-client:** allow global request options in constructor ([7fd3a4d](https://github.com/vpriem/ts-monorepo/commit/7fd3a4d4ab3e8248d1c853d0211ab84afc98e673))
-   **rest-client:** do throw on successful empty response ([47885dc](https://github.com/vpriem/ts-monorepo/commit/47885dcd0ea03e60531969abab44b07180227d7d))
-   **rest-client:** update dependency node-fetch to v2.6.6 ([9dbfd88](https://github.com/vpriem/ts-monorepo/commit/9dbfd8845e7d4f2b279a47a0b2ccf99a00508194))
-   **rest-client:** update dependency node-fetch to v2.6.7 ([a83d4e3](https://github.com/vpriem/ts-monorepo/commit/a83d4e3b6e792f1337841e439db2a0e97ef785b2))

## [1.1.1](https://github.com/vpriem/ts-monorepo/compare/@vpriem/rest-client@1.1.0...@vpriem/rest-client@1.1.1) (2021-10-07)

### Bug Fixes

-   **rest-client:** add decoded body to RequestError.body ([bd59eef](https://github.com/vpriem/ts-monorepo/commit/bd59eefa4b63b152bb1afb434d2681f8c972314f))
-   **rest-client:** update dependency node-fetch to v2.6.5 ([cd6fad4](https://github.com/vpriem/ts-monorepo/commit/cd6fad424cbdceea5fc187dda19f40b462e7e0de))

# [1.1.0](https://github.com/vpriem/ts-monorepo/compare/@vpriem/rest-client@1.0.4...@vpriem/rest-client@1.1.0) (2021-05-27)

### Features

-   **rest-client:** do not interfere with datadog status level ([7d82bc8](https://github.com/vpriem/ts-monorepo/commit/7d82bc8f2861cdbc4767f18b3071fd0438d2ade8))

### BREAKING CHANGES

-   **rest-client:** rename RequestError.status to RequestError.statusCode

## [1.0.4](https://github.com/vpriem/ts-monorepo/compare/@vpriem/rest-client@1.0.3...@vpriem/rest-client@1.0.4) (2021-03-02)

**Note:** Version bump only for package @vpriem/rest-client

## [1.0.3](https://github.com/vpriem/ts-monorepo/compare/@vpriem/rest-client@1.0.2...@vpriem/rest-client@1.0.3) (2021-02-10)

### Bug Fixes

-   **rest-client:** fix JSON decoding with charset ([fcaae4a](https://github.com/vpriem/ts-monorepo/commit/fcaae4a8097598d6068adf0a16c6358087d8fbfb))

## [1.0.2](https://github.com/vpriem/ts-monorepo/compare/@vpriem/rest-client@1.0.1...@vpriem/rest-client@1.0.2) (2021-01-22)

### Bug Fixes

-   **rest-client:** add undefined to Query type ([8159b0a](https://github.com/vpriem/ts-monorepo/commit/8159b0a91c586405b192c1be8d3b230c66c0f3f6))

## [1.0.1](https://github.com/vpriem/ts-monorepo/compare/@vpriem/rest-client@1.0.0...@vpriem/rest-client@1.0.1) (2021-01-22)

### Bug Fixes

-   publish only dist folder ([11022ae](https://github.com/vpriem/ts-monorepo/commit/11022aeeff4b0f147a59b564a7f6fdd3ee63aca2))
-   **rest-client:** expose Query type ([47761bd](https://github.com/vpriem/ts-monorepo/commit/47761bd22ed4411f90e91852c1a130b7c225b2b2))
-   **rest-client:** move @types/node-fetch to dependencies ([f710194](https://github.com/vpriem/ts-monorepo/commit/f71019411ab28326a626fa1604ec88676ff6619a))

# 1.0.0 (2021-01-21)

### Features

-   **rest-client:** initial commit ([88648b2](https://github.com/vpriem/ts-monorepo/commit/88648b27febab1d060704ded2c86cc2b7dc4c673))
