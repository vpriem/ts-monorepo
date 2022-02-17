# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.3.2](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.3.1...@vpriem/kafka-broker@1.3.2) (2022-02-17)


### Bug Fixes

* **kafka-broker:** update dependency kafkajs to v1.16.0 ([4a1fce7](https://github.com/vpriem/ts-monorepo/commit/4a1fce7ebd3bfc25ac5cc602bea5affb9dc60e6b))





## [1.3.1](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.3.0...@vpriem/kafka-broker@1.3.1) (2022-01-31)


### Bug Fixes

* **kafka-broker:** update dependency @kafkajs/confluent-schema-registry to v3.2.1 ([2861c09](https://github.com/vpriem/ts-monorepo/commit/2861c090b6dd33bc6795b02a7b90cfd3df517737))





# [1.3.0](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.2.0...@vpriem/kafka-broker@1.3.0) (2021-11-07)


### Bug Fixes

* **kafka-broker:** update dependency @kafkajs/confluent-schema-registry to v3.1.1 ([d633e0a](https://github.com/vpriem/ts-monorepo/commit/d633e0a967db729d1dd7d2f9cd055c9c93dc3c21))


### Features

* **kafka-broker:** enable multiple topic publication ([4ac06cb](https://github.com/vpriem/ts-monorepo/commit/4ac06cb8e94705f00239317bc61af14636abdad8))





# [1.2.0](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.1.0...@vpriem/kafka-broker@1.2.0) (2021-09-09)


### Bug Fixes

* **kafka-broker:** do not shortcut kafkajs retry mechanism ([b6f6957](https://github.com/vpriem/ts-monorepo/commit/b6f69579abafca8a107b0e723eb1106603132419))
* **kafka-broker:** make ConsumerConfig.groupId optional as it is auto generated ([2c5d095](https://github.com/vpriem/ts-monorepo/commit/2c5d095c0a9a2cca9f512658ceee63d56d3b239c))


### Features

* **kafka-broker:** rewrite on('message') to wait for each message to be fully processed ([8d10e5f](https://github.com/vpriem/ts-monorepo/commit/8d10e5f806ca1cb4438841c460836b4a4f205553))





# [1.1.0](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.1...@vpriem/kafka-broker@1.1.0) (2021-09-06)


### Bug Fixes

* **kafka-broker:** add Broker.schemaRegistry() to access registry ([b895874](https://github.com/vpriem/ts-monorepo/commit/b895874f79c0b0b4d6b4bc93311cde38b311cb15))
* **kafka-broker:** update @kafkajs/confluent-schema-registry to v3.0.1 ([c24b4d8](https://github.com/vpriem/ts-monorepo/commit/c24b4d88e002adbb4b9230d48b0cb29d84892f7b))


### Features

* **kafka-broker:** enable producing messages from last schema version ([cba1f57](https://github.com/vpriem/ts-monorepo/commit/cba1f57f2c4e8daac98c5413a2456662a1d92cbc))





## [1.0.1](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0...@vpriem/kafka-broker@1.0.1) (2021-05-27)


### Bug Fixes

* **kafka-broker:** remove misleading type for SubscriptionConfig.topics ([efad718](https://github.com/vpriem/ts-monorepo/commit/efad7187fc0112481d5b9f8582802fc46ebdba99))
* **kafka-broker:** update dependency @kafkajs/confluent-schema-registry to v3.0.0 ([670ca3f](https://github.com/vpriem/ts-monorepo/commit/670ca3fd554def695889465dd9045856c0e1c063))





# [1.0.0](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0-alpha.14...@vpriem/kafka-broker@1.0.0) (2021-05-23)

**Note:** Version bump only for package @vpriem/kafka-broker





# [1.0.0-alpha.14](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0-alpha.13...@vpriem/kafka-broker@1.0.0-alpha.14) (2021-04-14)


### Features

* **kafka-broker:** allow options in BrokerConfig.schemaRegistry ([c817dd2](https://github.com/vpriem/ts-monorepo/commit/c817dd2ca338bc645e38fb0d20e72cad80d8d1db))





# [1.0.0-alpha.13](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0-alpha.12...@vpriem/kafka-broker@1.0.0-alpha.13) (2021-03-23)


### Bug Fixes

* **kafka-broker:** update dependency @kafkajs/confluent-schema-registrye to 2.0.0 ([31c5059](https://github.com/vpriem/ts-monorepo/commit/31c505959b7eca6459422a9ea421eba7f7837410))





# [1.0.0-alpha.12](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0-alpha.11...@vpriem/kafka-broker@1.0.0-alpha.12) (2021-03-02)


### Bug Fixes

* **kafka-broker:** update dependency @types/node to 14.14.31 ([b04e700](https://github.com/vpriem/ts-monorepo/commit/b04e70020d17434f7fe3fbbba8ce07c0d925e100))





# [1.0.0-alpha.11](https://github.com/vpriem/ts-monorepo/compare/@vpriem/kafka-broker@1.0.0-alpha.10...@vpriem/kafka-broker@1.0.0-alpha.11) (2021-02-18)


### Bug Fixes

* **kafka-broker:** add content type header to string and buffer message value ([95fb04d](https://github.com/vpriem/ts-monorepo/commit/95fb04d53e822638b4368d5dd6b4c106ef3ca58a))
* **kafka-broker:** consolidate PublishMessageValue and ConsumeValue into one type ([3ecf420](https://github.com/vpriem/ts-monorepo/commit/3ecf420c961f4253c6982e2d33aa446c3d0463d2))
* **kafka-broker:** fix encodeMessage and null value ([03523af](https://github.com/vpriem/ts-monorepo/commit/03523afbc1f36676158de5b1bc2e44570b930365))
* **kafka-broker:** return buffer for buffer messages ([6132ba9](https://github.com/vpriem/ts-monorepo/commit/6132ba9443136b21160dfbdb4814537bba6ef244))
* **kafka-broker:** use content-type application/sr+avro for schema registry encoded message ([a5063bd](https://github.com/vpriem/ts-monorepo/commit/a5063bddd877506a9d9dd61813d22c869371850e))


### Features

* **kafka-broker:** add config defaults ([7fe6844](https://github.com/vpriem/ts-monorepo/commit/7fe68448c0009d005f14b93737a1ca0e35d8df64))
* **kafka-broker:** add enum type for content-types ([ba14483](https://github.com/vpriem/ts-monorepo/commit/ba1448326c776f6e55c6bbc1bfa525abd81c01fe))
* **kafka-broker:** add schema registry support ([514a765](https://github.com/vpriem/ts-monorepo/commit/514a765097c34ffa68f9b97dc7de127d5df1677a))





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
