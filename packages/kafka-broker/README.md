# kafka-broker

⚠️ UNDER DEVELOPMENT: The API might change in the future.

A wrapper around [KafkaJS](https://www.npmjs.com/package/kafkajs).  
Easily compose your broker and manage your Kafka resources
into one place to keep the overview inside your event driven service.

Heavily inspired from [Rascal](https://github.com/guidesmiths/rascal).

#### Features:

-   Global resource configuration
-   Lazy resource creation
-   Multiple brokers orchestration
-   Topic name alias
-   JSON encoding/decoding support
-   Async/Await
-   Type safe publishing/consuming
-   Consume messages with Handlers or EventEmitter
-   Global shutdown
-   Strong integration/unit tests

## Install

```shell
yarn add @vpriem/kafka-broker
```

## Usage

### Configuration

First configure the broker:

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

This will create a default producer and a default consumer with the groupId `my-service.from-my-topic`.  
Connections will be first started once published to `to-my-topic`
or the subscription `from-my-topic` is started.

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
            topics: 'my-long-topic-name',
            consumer: {
                groupId: 'my-service.from-my-topic',
            },
        },
    },
});
```

### Publishing messages

```typescript
await broker.publish('to-my-topic', { value: 'my-message' });
// Or mutilple messages:
await broker.publish('to-my-topic', [
    { value: 'my-message' },
    { value: 'my-message' },
]);
```

This will publish to `my-long-topic-name` using the `default` producer.

### Consuming messages

In order to consume messages you have to get the subscription and run it:

```typescript
import { ConsumeMessage } from '@vpriem/kafka-broker';

await broker
    .subscription('from-my-topic')
    .on('message', ({ value }: ConsumeMessage) => {
        console.log(value); // Print "my-message"
    })
    .run();
```

This will consume messages from `my-long-topic-name` using `my-service.from-my-topic` consumer group.

### JSON support

Published objects are automatically JSON encoded.  
A `content-type: application/json"` header is also added to the message headers.

```typescript
await broker.publish('to-my-topic', { value: { id: 1 } });
// Or type safe:
await broker.publish<{ id: number }>('to-my-topic', { value: { id: 1 } });
```

Previously JSON encoded messages are decoded back using the previously set `content-type` header.

```typescript
await broker
    .subscription('from-my-topic')
    .on('message', ({ value }: ConsumeMessage<object>) => {
        console.log(value.id); // Print 1
    })
    .run();

// Or type safe:

interface MyMessage {
    id: number;
}

await broker
    .subscription('from-my-topic')
    .on('message', ({ value }: ConsumeMessage<MyMessage>) => {
        console.log(value.id); // Print 1
    })
    .run();
```

### Handlers

You can use `Handlers` to consume messages.

```typescript
const broker = new Broker({
    // ...
    subscriptions: {
        'from-my-topic': {
            topics: 'my-long-topic-name',
            handler: async ({ value }) => {
                await myAsyncOperation(value);
            },
        },
    },
});

await broker.subscription('from-my-topic').run();
```

### Consuming from multiple topics

You can subscribe to multiple topics inside the same subscription/consumer group.  
And consume per topic messages with `.on('message.{topic|alias}')` or by defining handlers.

```typescript
const broker = new Broker({
    // ...
    publications: {
        'to-my-topic-1': 'my-long-topic-name-1',
        'to-my-topic-2': 'my-long-topic-name-2',
    },
    subscriptions: {
        'from-all-topics': {
            topics: [
                {
                    topic: 'my-long-topic-name-1',
                    alias: 'my-topic-1',
                    handler: async ({ value }) => {
                        // This will be called with "value-1"
                        await myAsyncOperation(value);
                    },
                },
                {
                    topic: 'my-long-topic-name-2',
                    alias: 'my-topic-2',
                    handler: async ({ value }) => {
                        // This will be called with "value-2"
                        await myAsyncOperation(value);
                    },
                },
            ],
            handler: async ({ value }) => {
                // This will be called with "value-1" and "value-2"
                await myAsyncOperation(value);
            },
        },
    },
});

await broker
    .subscription('from-all-topics')
    .on('message', ({ value }) => {
        console.log(value.id); // Print "value-1" and "value-2"
    })
    .on('message.my-topic-1', ({ value }) => {
        console.log(value.id); // Print "value-1"
    })
    .on('message.my-topic-2', ({ value }) => {
        console.log(value.id); // Print "value-2"
    })
    .run();

await broker.publish('to-my-topic-1', { value: 'value-1' });
await broker.publish('to-my-topic-2', { value: 'value-2' });
```

### Shutdown

Shutdown the broker to disconnect all producers and consumers:

```typescript
await broker.shutdown();
```

### Broker container

The `BrokerContainer` helps you to manage multiple `Broker` instance,
helpful to compose a company broker.

It shares the same interface as the `Broker` class.

```typescript
const broker = new BrokerContainer({
    namespace: 'my-service',
    brokers: {
        public: {
            config: {
                brokers: [process.env.KAFKA_BROKER as string],
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
                brokers: [process.env.KAFKA_BROKER as string],
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
    .subscriptionList()
    .on('message', ({ value }) => {
        console.log(value); // Print "my-public-message" and "my-private-message"
    })
    .runAll();

await broker.publish('public.my-topic', { value: 'my-public-message' });
await broker.publish('private.my-topic', { value: 'my-private-message' });
```

## API

...

## License

[MIT](LICENSE)
