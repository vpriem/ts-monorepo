import { buildContainerConfig } from '../buildContainerConfig';

describe('config+container', () => {
    it('should build config', () => {
        expect(
            buildContainerConfig({
                namespace: 'my-service',
                schemaRegistry: {
                    host: 'localhost:3',
                    options: { JSON: { strict: true } },
                },
                brokers: {
                    broker1: {
                        config: {
                            brokers: ['localhost:1'],
                        },
                        publications: {
                            'to-topic1': 'my-topic-1',
                        },
                        subscriptions: {
                            'from-topic1': 'my-topic-1',
                        },
                    },
                    broker2: {
                        config: {
                            brokers: ['localhost:2'],
                        },
                        producers: {
                            'extra-producer': {
                                allowAutoTopicCreation: false,
                            },
                        },
                        publications: {
                            'to-topic2': {
                                topic: 'my-topic-2',
                                producer: 'extra-producer',
                                schema: { id: 2 },
                            },
                        },
                        subscriptions: {
                            'from-topic2': {
                                topics: ['my-topic-2'],
                                consumer: { groupId: 'keep-that-group-id' },
                            },
                        },
                    },
                },
            })
        ).toEqual({
            namespace: 'my-service',
            kafka: {
                broker1: {
                    clientId: 'my-service',
                    brokers: ['localhost:1'],
                },
                broker2: {
                    clientId: 'my-service',
                    brokers: ['localhost:2'],
                },
            },
            schemaRegistry: {
                host: 'localhost:3',
                options: { JSON: { strict: true } },
            },
            producers: {
                'broker1/default': {
                    kafka: 'broker1',
                },
                'broker2/default': {
                    kafka: 'broker2',
                },
                'broker2/extra-producer': {
                    kafka: 'broker2',
                    producer: {
                        allowAutoTopicCreation: false,
                    },
                },
            },
            publications: {
                'broker1/to-topic1': {
                    topic: 'my-topic-1',
                    producer: 'broker1/default',
                },
                'broker2/to-topic2': {
                    topic: 'my-topic-2',
                    // TODO: producer: 'broker2/extra-producer',
                    producer: 'extra-producer',
                    schema: { id: 2 },
                },
            },
            subscriptions: {
                'broker1/from-topic1': {
                    kafka: 'broker1',
                    topics: [{ topic: 'my-topic-1' }],
                    consumer: { groupId: 'my-service.broker1.from-topic1' },
                },
                'broker2/from-topic2': {
                    kafka: 'broker2',
                    topics: [{ topic: 'my-topic-2' }],
                    consumer: { groupId: 'keep-that-group-id' },
                },
            },
        });
    });

    it('should build config with default', () => {
        expect(
            buildContainerConfig({
                namespace: 'my-service',
                defaults: {
                    config: {
                        clientId: 'my-super-client-id',
                        requestTimeout: 5,
                    },
                    producer: {
                        allowAutoTopicCreation: true,
                    },
                    consumer: {
                        groupId: 'this-will-be-overridden',
                        allowAutoTopicCreation: false,
                    },
                },
                brokers: {
                    broker1: {
                        config: {
                            brokers: ['localhost:1'],
                        },
                        subscriptions: {
                            'from-topic1': 'my-topic-1',
                        },
                    },
                    broker2: {
                        config: {
                            brokers: ['localhost:2'],
                        },
                    },
                },
            })
        ).toEqual({
            namespace: 'my-service',
            kafka: {
                broker1: {
                    clientId: 'my-super-client-id',
                    requestTimeout: 5,
                    brokers: ['localhost:1'],
                },
                broker2: {
                    clientId: 'my-super-client-id',
                    requestTimeout: 5,
                    brokers: ['localhost:2'],
                },
            },
            producers: {
                'broker1/default': {
                    kafka: 'broker1',
                    producer: {
                        allowAutoTopicCreation: true,
                    },
                },
                'broker2/default': {
                    kafka: 'broker2',
                    producer: {
                        allowAutoTopicCreation: true,
                    },
                },
            },
            publications: {},
            subscriptions: {
                'broker1/from-topic1': {
                    kafka: 'broker1',
                    topics: [{ topic: 'my-topic-1' }],
                    consumer: {
                        groupId: 'my-service.broker1.from-topic1',
                        allowAutoTopicCreation: false,
                    },
                },
            },
        });
    });
});
