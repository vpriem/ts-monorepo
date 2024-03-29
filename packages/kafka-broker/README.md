# kafka-broker

Easily compose and manage your kafka resources in one place.

A wrapper around [KafkaJS](https://www.npmjs.com/package/kafkajs)
heavily inspired from [Rascal](https://github.com/guidesmiths/rascal).

## Table of contents

-   [Install](#install)
-   [Concepts](#concepts)
-   [Configuration](#configuration)
-   [Publishing](#publishing)
    -   [Multiple topics](#multiple-topics)
    -   [Batching](#batching)
-   [Consuming](#consuming)
    -   [Handlers](#handlers)
    -   [Consumer group](#consumer-group)
    -   [Parallelism](#parallelism)
    -   [Error handling](#error-handling)
-   [Encoding](#encoding)
    -   [JSON](#json)
    -   [AVRO](#avro)
    -   [Plain text](#plain-text)
    -   [Enforce contentType](#enforce-contenttype)
-   [Schema registry](#schema-registry)
-   [Typescript](#typescript)
-   [Dead letter](#dead-letter)
-   [Shutdown](#shutdown)
-   [Advanced configuration](#advanced-configuration)
    -   [Using defaults](#using-defaults)
    -   [Topic alias](#topic-alias)
    -   [Multiple producers](#multiple-producers)
    -   [Multiple brokers](#multiple-brokers)
    -   [Full configuration](#full-configuration)
-   [Running tests](#running-tests)
-   [License](#license)

## Install

```shell
yarn add @vpriem/kafka-broker
# or
npm install @vpriem/kafka-broker
```

## Concepts

This library is using two concepts: Publications and Subscriptions.

A `Publication` is a named configuration to produce messages to a certain topic with a specific producer and options.

A `Subscription` is a named configuration to consumer messages from certain topics with a specific consumer group and options.

## Configuration

In order to publish or consume messages, you need first to configure your broker:

```typescript
import { Broker } from '@vpriem/kafka-broker';

const broker = new Broker({
    namespace: 'my-service',
    config: {
        brokers: [process.env.KAFKA_BROKER as string],
    },
    publications: {
        'to-my-topic': 'my-long-topic-name',
    },
    subscriptions: {
        'from-my-topic': 'my-long-topic-name',
    },
});
```

This will create a `default` producer to produce messages to the topic named `my-long-topic-name`
and a consumer with the consumer group `my-service.from-my-topic` to consume from that topic.

Connections are lazy and will be first established once published or subscribed.

This is equivalent of doing:

```typescript
const broker = new Broker({
    namespace: 'my-service',
    config: {
        clientId: 'my-service',
        brokers: [process.env.KAFKA_BROKER as string],
    },
    producers: {
        default: {},
    },
    publications: {
        'to-my-topic': {
            topic: 'my-long-topic-name',
            producer: 'default',
        },
    },
    subscriptions: {
        'from-my-topic': {
            topics: ['my-long-topic-name'],
            consumer: {
                groupId: 'my-service.from-my-topic',
            },
        },
    },
});
```

## Publishing

In order to publish messages to a topic you need to refer to his publication name:

```typescript
await broker.publish('to-my-topic', { value: 'my-message' });
// Or mutilple messages:
await broker.publish('to-my-topic', [
    { value: 'my-message' },
    { value: 'my-message' },
]);
```

This will publish to `my-long-topic-name` using the `default` producer.

### Multiple topics

You can publish simultaneously to multiple topics:

```typescript
new Broker({
    // ...
    publications: {
        'to-multiple-topic': {
            topic: ['my-first-topic', 'my-second-topic'],
        },
    },
});

await broker.publish('to-multiple-topic', { value: 'my-message' });
```

This will publish to `my-first-topic` and `my-second-topic` in a batch.

### Batching

You can configure the producers to automatically batch messages.
This will delay sending messages so that more messages can be sent into a single request.  
This can significantly reduce the number of requests made to the cluster, and improve performance overall. 

```typescript
new Broker({
    // ...
    producers: {
        default: {
            batch: {
                size: 150,
                lingerMs: 100,
            }
        },
    },
});
```

- `size`: maximum number of messages to batch in one request
- `lingerMs`: maximum duration to fill the batch

If `size` is reached, the batch request will be sent immediately regardless of `lingerMs`.  
Otherwise, the producer will wait up to `lingerMs` to send the batch request.

⚠️ Be aware that a large `size` might increase memory usage and a high `lingerMs` might increase latency.

Because the [batch request](https://kafka.js.org/docs/producing#producing-to-multiple-topics) can contain multiple topics, the options `acks`, `compression` and `timeout` have to be provided on the batch level, this also means that any provided `config` on the `publications` level will be discarded:

```typescript
new Broker({
    // ...
    producers: {
        default: {
            batch: {
                size: 150,
                lingerMs: 100,
                acks: 1,
                compression: CompressionTypes.GZIP,
            }
        },
    },
    publications: {
        'to-my-topic': {
            topic: 'my-long-topic-name',
            config: { acks: 0 }, // this will be ignored
        },
    },
});
```

## Consuming

In order to start consuming messages from a topic you need to subscribe and run the subscription:

```typescript
await broker
    .subscription('from-my-topic')
    .on('message', (value, message, topic, partition) => {
        //  ...
    })
    .run();
```

This will consume messages from `my-long-topic-name` using the consumer group `my-service.from-my-topic`.

Or you can just run all subscriptions:

```typescript
await broker
    .subscriptionList()
    .on('message', (value) => {
        // Consume from all registered topics
    })
    .on('message.my-long-topic-name', (value) => {
        // Or from "my-long-topic-name" only
    })
    .run();
```

### Handlers

Handlers are a different approach to consume messages by using small functions equivalent to lambdas
and can help to structure your code better by splitting them into small files:

```typescript
const handler: Handler = async (value) => {
    await myAsyncOperation(value);
};

const broker = new Broker({
    // ...
    subscriptions: {
        'from-my-topic': {
            topics: ['my-long-topic-name'],
            handler,
        },
    },
});

await broker.subscription('from-my-topic').run();
```

### Consumer group

Consumer group are important and needs to be unique across applications.  
If no `groupId` is specified in the subscription configuration, the name is auto generated as following `[namespace].[subscription]`:

```typescript
const broker = new Broker({
    namespace: 'my-service',
    // ...
    subscriptions: {
        'from-my-topic': 'my-long-topic-name',
    },
});
```

This will create and use the consumer group `my-service.from-my-topic` for the topic `my-long-topic-name`.

### Parallelism

⚠️ Experimental ⚠️

`kakfa-broker` is build on top of `kafkajs` [eachMessage](https://kafka.js.org/docs/consuming#a-name-each-message-a-eachmessage)
which is consuming one message at a time.

Sometimes you might want to speed up consumption in special cases where you don't care about message order.

The library come with 2 built-in parallelism modes build on top of `kafkajs` [eachBatch](https://kafka.js.org/docs/consuming#a-name-each-batch-a-eachbatch):

- `all-at-once`: all messages of a batch are consumed at once, in parallel.
- `by-partition-key`: same as `all-at-once` except that all messages of the same partition key are consumed in series, one after the other. Messages without a partition key are grouped together.

Be aware that those 2 modes can affect your workload.

```typescript
const broker = new Broker({
    namespace: 'my-service',
    // ...
    subscriptions: {
        'from-my-topic': {
            topic: 'my-long-topic-name',
            parallelism: 'by-partition-key'
        },
    },
});
```

### Error handling

KafkaJs will restart consumer on errors that are considered as "retriable" (see [restartOnFailure](https://kafka.js.org/docs/1.13.0/configuration#a-name-restart-on-failure-a-restartonfailure)) 
but not on errors considered as "non-retriable".

The broker instance will emit those "non-retriable" errors as [error events](https://nodejs.org/api/events.html#error-events).

## Encoding

### JSON

Published objects are automatically encoded to JSON.

```typescript
await broker.publish('to-my-topic', { value: { id: 1 } });
```

A `content-type: application/json` header is added to the message headers
in order to automatically decode messages as object on the consumer side:

```typescript
await broker
    .subscription('from-my-topic')
    .on('message', (value) => {
        console.log(value.id); // Print 1
    })
    .run();
```

### AVRO

Not supported yet.

### Plain text

For string messages, a `content-type: text/plain` header is added to the message headers
and automatically decoded as string on the consumer side:

```typescript
await broker.publish('to-my-topic', { value: 'my-value' });

await broker
    .subscription('from-my-topic')
    .on('message', (value) => {
        console.log(value); // Print "my-value"
    })
    .run();
```

### Enforce contentType

In some case you might have messages produced by another applications without the `content-type` header being set.  
You can enforce the decoding on your side by specifying the `contentType` in the subscription configuration:

```typescript
const broker = new Broker({
    // ...
    subscriptions: {
        'from-json-topic': {
            topics: ['my-long-json-topic-name'],
            contentType: 'application/json',
        },
    },
});
```

## Schema registry

Schema registry is supported and can be configured as following:

```typescript
const broker = new Broker({
    // ...
    schemaRegistry: process.env.SCHEMA_REGISTRY_URL as string,
    // or
    schemaRegistry: {
        host: process.env.SCHEMA_REGISTRY_URL as string,
        options: {
            /* SchemaRegistryOptions */
        },
    },
});
```

For the full configuration please refer to [@kafkajs/confluent-schema-registry](https://kafkajs.github.io/confluent-schema-registry/).

Producers need to specify the schema registry id or subject/version in the publication config:

```typescript
const broker = new Broker({
    // ...
    publications: {
        'to-my-topic': {
            topic: 'my-long-topic-name',
            schema: 1, // equivalent to { id: 1 }
        },
        // or
        'to-my-topic': {
            topic: 'my-long-topic-name',
            schema: 'my-subject', // equivalent to { subject: 'my-subject', version: 'latest' }
        },
    },
});
```

By doing this, a `content-type: application/schema-registry` header will be added to the message,
in order to automatically decode messages using schema registry on the consumer side.

Accessing the registry:

```typescript
const registry = broker.schemaRegistry();

await registry?.register(/* Schema */);
```

## Typescript

Typescript generics are supported for more type safety:

```typescript
interface MyEvent {
    id: number;
}

await broker
    .subscription('from-my-topic')
    .on<MyEvent>('message', ({ id }) => {
        console.log(id); // Print 1
    })
    .run();

// or with an handler
const MyHandler: Handler<MyEvent> = async ({ id }) => {
    console.log(id); // Print 1
};

await broker.publish<MyEvent>('to-my-topic', { value: { id: 1 } });
```

## Dead letter

Unprocessed messages due to error can be send to a dead letter topic to be analysed later:

```typescript
const broker = new Broker({
    // ...
    publications: {
        'to-my-topic': 'my-long-topic-name',
        'to-my-topic-dlx': 'my-long-topic-name-dlx',
    },
    subscriptions: {
        'from-my-topic': {
            topics: ['my-long-topic-name'],
            deadLetter: 'to-my-topic-dlx',
        },
    },
});
```

Note that the `deadLetter` is the publication name and not the topic itself.

## Shutdown

It is important to shutdown the broker to disconnect all producers and consumers:

```typescript
await broker.shutdown();
```

## Advanced configuration

### Using defaults

```typescript
const broker = new Broker({
    // ...
    defaults: {
        producer: {
            /* KafkaProducerConfig to be applyed to all producers */
        },
        consumer: {
            /* KafkaConsumerConfig to be applyed to all consumers */
        },
    },
});
```

### Topic alias:

```typescript
const broker = new Broker({
    // ...
    subscriptions: {
        'from-all-topics': [
            { topic: 'my-long-topic-name-1', alias: 'my-topic1' },
            { topic: 'my-long-topic-name-2', alias: 'my-topic2' },
        ],
    },
});

await broker
    .subscription('from-all-topics')
    .on('message', (value) => {
        // Consume from "my-long-topic-name-1" and "my-long-topic-name-2"
    })
    .on('message.my-topic1', (value) => {
        // Consume from "my-long-topic-name-1" only
    })
    .on('message.my-topic2', (value) => {
        // Consume from "my-long-topic-name-2" only
    })
    .run();
```

Or with handlers:

```typescript
const broker = new Broker({
    // ...
    subscriptions: {
        'from-all-topics': [
            {
                topic: 'my-long-topic-name-1',
                handler: async (value) => {
                    // Consume from "my-long-topic-name-1" only
                },
            },
            {
                topic: 'my-long-topic-name-2',
                handler: async (value) => {
                    // Consume from "my-long-topic-name-2" only
                },
            },
        ],
    },
});

await broker.subscriptionList().run();
```

### Multiple producers

You can define multiple producers, configure them differently and reuse them across publications:

```typescript
const broker = new Broker({
    // ...
    producers: {
        'producer-1': {
            /* KafkaProducerConfig */
        },
        'producer-2': {
            /* KafkaProducerConfig */
        },
    },
    publications: {
        'to-my-topic-1': {
            topic: 'my-long-topic-name-1',
            producer: 'producer-1',
        },
        'to-my-topic-2': {
            topic: 'my-long-topic-name-2',
            producer: 'producer-2',
        },
    },
});

// This will use "producer-1"
await broker.publish('to-my-topic-1', { value: 'my-message-to-topic-1' });
// This will use "producer-2"
await broker.publish('to-my-topic-2', { value: 'my-message-to-topic-2' });
```

### Multiple brokers

You can also build a `Broker` from resources coming from multiple kafka instances:

```typescript
const broker = new Broker({
    namespace: 'my-service',
    brokers: {
        public: {
            config: {
                brokers: [process.env.KAFKA_PUBLIC_BROKER as string],
            },
            publications: {
                'my-topic': 'my-long-topic-name',
            },
            subscriptions: {
                'my-topic': 'my-long-topic-name',
            },
        },
        private: {
            config: {
                brokers: [process.env.KAFKA_PRIVATE_BROKER as string],
            },
            publications: {
                'my-topic': 'my-long-topic-name',
            },
            subscriptions: {
                'my-topic': 'my-long-topic-name',
            },
        },
    },
});

await broker
    .subscription('public/my-topic')
    .on('message', (value) => {
        // Consume from public only
    })
    .run();

await broker
    .subscription('private/my-topic')
    .on('message', (value) => {
        // Consume from private only
    })
    .run();

await broker
    .subscriptionList()
    .on('message', (value) => {
        console.log(value); // Consume from public and private
    })
    .run();

await broker.publish('public/my-topic', { value: 'my-public-message' });
await broker.publish('private/my-topic', { value: 'my-private-message' });
```

### Full configuration

```typescript
const broker = new Broker({
    namespace: 'my-service',
    defaults: {
        // optional
        producer: {
            /* KafkaProducerConfig */
        }, // optional
        consumer: {
            /* KafkaConsumerConfig */
        }, // optional
    },
    config: {
        /* KafkaConfig */
    },
    schemaRegistry: {
        // optional
        host: 'http://localhost:8081',
        options: {
            /* SchemaRegistryOptions */
        }, // optional
    },
    producers: {
        // optional
        [name]: {
            /* KafkaProducerConfig */
        }, // optional
    },
    publications: {
        [name]: 'my-topic',
        [name]: {
            topic: 'my-topic',
            producer: 'my-producer', // optional, default to "default"
            config: {
                /* ProducerRecord */
            }, // optional
            messageConfig: {
                /* MessageConfig */
            }, // optional
            schemaId: 1, // optional
        },
    },
    subscriptions: {
        [name]: 'my-topic',
        [name]: [
            'my-topic',
            {
                topic: 'my-topic',
                alias: 'my-topic-alias', // optional
                handler: () => {}, // optional
            },
        ],
        [name]: {
            topics: [
                'my-topic',
                {
                    topic: 'my-topic',
                    alias: 'my-topic-alias', // optional
                    handler: () => {}, // optional
                },
            ],
            consumer: {
                /* ConsumerConfig */
            }, // optional
            runConfig: {
                /* RunConfig */
            }, // optional
            handler: () => {}, // optional
            contentType: 'application/json', // optional
        },
    },
});
```

## Running tests

```shell
yarn install
yarn k up
yarn k test
```

## License

[MIT](LICENSE)
