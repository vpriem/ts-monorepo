# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-alpha.10](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0-alpha.9...@vpriem/kafka-broker@1.0.0-alpha.10) (2021-02-15)


### Bug Fixes

* **kafka-broker:** add @types/node to dependencies ([0db8636](https://github.com/vpriem/ts-monorepo/commit/0db8636580817fd0d8afd6804d7604813d0291df))





# [1.0.0-alpha.9](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0-alpha.8...@vpriem/kafka-broker@1.0.0-alpha.9) (2021-02-14)


### Bug Fixes

* **kafka-broker:** do not expose BrokerInterface.emit() ([cf5272f](https://github.com/vpriem/ts-monorepo/commit/cf5272f7713af950f798e1e44674a77656e9159d))





# [1.0.0-alpha.8](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0-alpha.7...@vpriem/kafka-broker@1.0.0-alpha.8) (2021-02-11)


### Features

* **kafka-broker:** add publish function to Handler ([e031496](https://github.com/vpriem/ts-monorepo/commit/e03149656989ce6b2c75525088a3457cbb6f0ead))
* **kafka-broker:** change Handler signature to receive kafka payload ([199b920](https://github.com/vpriem/ts-monorepo/commit/199b9208da449a0f4eb70f7c2baf84510dda6cac))
* **kafka-broker:** merge Broker/BrokerContainer into one ([c1c845d](https://github.com/vpriem/ts-monorepo/commit/c1c845d5cf695ea5fa3909950a1979e25be3347b))
* **kafka-broker:** rename ConsumeMessageValue to ConsumeValue ([e10e49f](https://github.com/vpriem/ts-monorepo/commit/e10e49f18cbb599d4a3d206d4ccd4c472ee986c8))





# [1.0.0-alpha.7](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0-alpha.6...@vpriem/kafka-broker@1.0.0-alpha.7) (2021-02-10)


### Bug Fixes

* **kafka-broker:** change method overload order because of typing error ([a7c70b7](https://github.com/vpriem/ts-monorepo/commit/a7c70b78c802cbe857b677c49acaf34437b33e71))





# [1.0.0-alpha.6](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0-alpha.5...@vpriem/kafka-broker@1.0.0-alpha.6) (2021-02-09)


### Features

* **kafka-broker:** add Publisher and bind to handler ([d8f7165](https://github.com/vpriem/ts-monorepo/commit/d8f7165d64eb2b58bf0f87996d1e90a6ef783978))
* **kafka-broker:** getMessage() accepts SubscriptionList ([5a0ba70](https://github.com/vpriem/ts-monorepo/commit/5a0ba702ff7acefdc6445f40902a388aa49e0a66))
* **kafka-broker:** refactor Subscription and SubscriptionList with SubscriptionInterface ([afbce26](https://github.com/vpriem/ts-monorepo/commit/afbce26c70986047f1cdf8adb48aad5e44f7a2c2))
* **kafka-broker:** remove Subscription.name ([043312b](https://github.com/vpriem/ts-monorepo/commit/043312b4c06cb11084d023c77c4cd7aff9137b11))





# [1.0.0-alpha.5](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0-alpha.4...@vpriem/kafka-broker@1.0.0-alpha.5) (2021-02-08)


### Features

* **kafka-broker:** expose Broker.namespace ([ab27cb1](https://github.com/vpriem/ts-monorepo/commit/ab27cb1808b40cdf9d80cee68f59bf84219f0a55))
* **kafka-broker:** expose getMessage helper for unit test ([50db2d1](https://github.com/vpriem/ts-monorepo/commit/50db2d1269ddcd1d845f98842a62cc03630caa06))
* **kafka-broker:** remove duplicated type AsyncHandler ([dacdc7d](https://github.com/vpriem/ts-monorepo/commit/dacdc7d3fb587e23e2efaf978d0d5a657e00df21))
* **kafka-broker:** remove SubscriptionConfig.topics string signature ([bc0df01](https://github.com/vpriem/ts-monorepo/commit/bc0df01d82a0a2acba0ec3f6d9c9dc2695924808))





# [1.0.0-alpha.4](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0-alpha.3...@vpriem/kafka-broker@1.0.0-alpha.4) (2021-02-04)


### Bug Fixes

* **kafka-broker:** fix PromiseRejectionHandledWarning error ([1fa80d8](https://github.com/vpriem/ts-monorepo/commit/1fa80d8d7331d62cc0b6ad510585c1367aade3f5))


### Features

* **kafka-broker:** catch async rejection ([b56fde7](https://github.com/vpriem/ts-monorepo/commit/b56fde787dc8e351de1c56c83ae794ab5cc5e08a))
* **kafka-broker:** expose BrokerContainer.get ([11258d9](https://github.com/vpriem/ts-monorepo/commit/11258d98b3859e73ec29be642d8d7abcf3af9256))
* **kafka-broker:** propagate error up to Broker ([3385cb9](https://github.com/vpriem/ts-monorepo/commit/3385cb94a0f29f24d86f3b7d29aaa1092d2e1262))





# [1.0.0-alpha.3](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0-alpha.2...@vpriem/kafka-broker@1.0.0-alpha.3) (2021-02-03)


### Features

* **kafka-broker:** add subscription contentType overload ([ab2050f](https://github.com/vpriem/ts-monorepo/commit/ab2050f2c63d5e229005d43900b7d88e8be77b90))
* **kafka-broker:** change Handler and Subscription.on signature ([21e95cc](https://github.com/vpriem/ts-monorepo/commit/21e95cc564838a1bc349dfddcda4abd8d5dc48f2))





# 1.0.0-alpha.2 (2021-02-02)


### Features

* **kafka-broker:** initial commit ([3b4da68](https://github.com/vpriem/ts-monorepo/commit/3b4da68e9f8870ea27655d37613180544007188a))
* **kafka-broker:** simplify ProducerConfig ([4655e12](https://github.com/vpriem/ts-monorepo/commit/4655e12581639dff5f51802a8b8c7f8dfb4a7acf))
