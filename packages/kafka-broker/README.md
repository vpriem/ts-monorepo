# kafka-broker

A wrapper around [KafkaJS](https://www.npmjs.com/package/kafkajs).

Easily compose your broker and manage your Kafka resources
into one place to keep the overview inside your event driven service.

Heavily inspired from [Rascal](https://github.com/guidesmiths/rascal).

⚠️ UNDER DEVELOPMENT: The API might change in the future. ⚠️

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
await broker
    .subscription('from-my-topic')
    .on('message', (value, message, topic, partition) => {
        console.log(value); // Print "my-message"
    })
    .run();
```

This will consume messages from `my-long-topic-name` using `my-service.from-my-topic` consumer group.

### JSON support

Published objects are automatically JSON encoded.  
A `content-type: application/json` header is also added to the message headers.

```typescript
await broker.publish('to-my-topic', { value: { id: 1 } });
// Or type safe:
await broker.publish<{ id: number }>('to-my-topic', { value: { id: 1 } });
```

Previously JSON encoded messages are decoded back using the previously set `content-type` header.

```typescript
await broker
    .subscription('from-my-topic')
    .on('message', (value) => {
        console.log(value.id); // Print 1
    })
    .run();

// Or type safe:

interface MyEvent {
    id: number;
}

await broker
    .subscription('from-my-topic')
    .on<MyEvent>('message', (value) => {
        console.log(value.id); // Print 1
    })
    .run();
```

In case JSON messages were produced without any `content-type: application/json` header,
you can enforce messages to be JSON decoded:

```typescript
const broker = new Broker({
    // ...
    subscriptions: {
        'from-json-topic': {
            topics: 'my-long-topic-name',
            contentType: 'application/json',
        },
    },
});

await broker
    .subscription('from-json-topic')
    .on<MyEvent>('message', (value) => {
        console.log(value.id);
    })
    .on('error', (error) => {
        console.log(error); // JSON.parse failed
    })
    .run();
```

### Producer

You can create your set of producers, configure them differently and reuse them across publications:

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
        'my-topic-1': {
            topic: 'my-long-topic-name-1',
            producer: 'producer-1',
        },
        'my-topic-2': {
            topic: 'my-long-topic-name-2',
            producer: 'producer-2',
        },
    },
});

// This will use "producer-1"
await broker.publish('my-topic-1', { value: 'my-message-to-topic-1' });
// This will use "producer-2"
await broker.publish('my-topic-2', { value: 'my-message-to-topic-2' });
```

### Handlers

You can use `Handlers` to consume messages.

```typescript
const broker = new Broker({
    // ...
    subscriptions: {
        'from-my-topic': {
            topics: 'my-long-topic-name',
            handler: async (value) => {
                await myAsyncOperation(value);
            },
        },
    },
});

await broker.subscription('from-my-topic').run();

// Or type safe:

const MyHandler: Handler<MyEvent> = async (value) => {
    await myAsyncOperation(value.id);
};

new Broker({
    // ...
    subscriptions: {
        'from-my-topic': {
            topics: 'my-long-topic-name',
            handler,
        },
    },
});
```

### Run all subscriptions

Run all subscriptions, and consume from all:

```typescript
const broker = new Broker({
    // ...
    subscriptions: {
        'from-my-topic-1': 'my-long-topic-name-1',
        'from-my-topic-2': 'my-long-topic-name-2',
    },
});

await broker
    .subscriptionList()
    .on('message', (value) => {
        /*
            Consume from both topics
            Using two separate consumer groups
        */
    })
    .run();
```

### Consuming from multiple topics

You can subscribe to multiple topics inside the same subscription/consumer group:

```typescript
const broker = new Broker({
    // ...
    subscriptions: {
        'from-all-topics': ['my-long-topic-name-1', 'my-long-topic-name-2'],
    },
});

await broker
    .subscription('from-all-topics')
    .on('message', (value) => {
        console.log(value); // All messages
    })
    .on('message.my-long-topic-name-1', (value) => {
        console.log(value); // Messages of topic 1
    })
    .on('message.my-long-topic-name-2', (value) => {
        console.log(value); // Messages of topic 2
    })
    .run();
```

Using aliases:

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
        console.log(value); // All messages
    })
    .on('message.my-topic1', (value) => {
        console.log(value); // Messages of topic 1
    })
    .on('message.my-topic2', (value) => {
        console.log(value); // Messages of topic 2
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
                    await myAsyncOperation(value);
                },
            },
            {
                topic: 'my-long-topic-name-2',
                handler: async (value) => {
                    await myAsyncOperation(value);
                },
            },
        ],
    },
});

await broker.subscriptionList().run();
```

### Error handling

Subscription error are propagated to the broker,
but you have to listen to them in order to avoid your application to crash:

```typescript
broker.on('error', console.error);
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
    .get('public')
    .subscriptionList()
    .on('message', (value) => {
        console.log(value); // Consume only from public
    });

await broker
    .get('private')
    .subscriptionList()
    .on('message', (value) => {
        console.log(value); // Consume only from private
    });

await broker
    .subscriptionList()
    .on('message', (value) => {
        console.log(value); // Consume from public and private
    })
    .run();

await broker.publish('public/my-topic', { value: 'my-public-message' });
await broker.publish('private/my-topic', { value: 'my-private-message' });
```

## API

...

## License

[MIT](LICENSE)
