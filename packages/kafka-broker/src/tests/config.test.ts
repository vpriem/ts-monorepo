import { buildConfig } from '../buildConfig';

describe('config', () => {
    it('should build config', () => {
        expect(
            buildConfig({
                namespace: 'my-service',
                config: {
                    brokers: ['localhost:1'],
                },
                schemaRegistry: 'localhost:2',
                producers: {
                    'my-producer-2': { allowAutoTopicCreation: false },
                },
                publications: {
                    'to-topic1': 'my-topic-1',
                    'to-topic2': {
                        topic: 'my-topic-2',
                        producer: 'my-producer-2',
                    },
                },
                subscriptions: {
                    'from-topic0': 'my-topic-0',
                    'from-topic1': [
                        'my-topic-1.0',
                        {
                            topic: 'my-topic-1.1',
                            alias: 'alias-to-my-topic1',
                        },
                    ],
                    'from-topic2': {
                        topics: [
                            {
                                topic: 'my-topic-2',
                                fromBeginning: true,
                            },
                        ],
                    },
                    'from-topic3': {
                        topics: ['my-topic-3'],
                        consumer: { groupId: 'keep-that-group-id' },
                        contentType: 'application/json',
                    },
                    'from-all-topics': [
                        'my-topic-0',
                        'my-topic-1',
                        'my-topic-2',
                        'my-topic-3',
                    ],
                    'from-all-again': [
                        { topic: 'my-topic-0' },
                        { topic: 'my-topic-1' },
                        { topic: 'my-topic-2' },
                        { topic: 'my-topic-3', alias: 'alias-to-my-topic-3' },
                    ],
                },
            })
        ).toEqual({
            namespace: 'my-service',
            kafka: {
                default: {
                    clientId: 'my-service',
                    brokers: ['localhost:1'],
                },
            },
            schemaRegistry: { host: 'localhost:2' },
            producers: {
                default: {
                    kafka: 'default',
                },
                'my-producer-2': {
                    kafka: 'default',
                    producer: { allowAutoTopicCreation: false },
                },
            },
            publications: {
                'to-topic1': {
                    topic: 'my-topic-1',
                    producer: 'default',
                },
                'to-topic2': {
                    topic: 'my-topic-2',
                    producer: 'my-producer-2',
                },
            },
            subscriptions: {
                'from-topic0': {
                    kafka: 'default',
                    topics: [{ topic: 'my-topic-0' }],
                    consumer: { groupId: 'my-service.from-topic0' },
                },
                'from-topic1': {
                    kafka: 'default',
                    topics: [
                        { topic: 'my-topic-1.0' },
                        {
                            topic: 'my-topic-1.1',
                            alias: 'alias-to-my-topic1',
                        },
                    ],
                    consumer: { groupId: 'my-service.from-topic1' },
                },
                'from-topic2': {
                    kafka: 'default',
                    topics: [
                        {
                            topic: 'my-topic-2',
                            fromBeginning: true,
                        },
                    ],
                    consumer: { groupId: 'my-service.from-topic2' },
                },
                'from-topic3': {
                    kafka: 'default',
                    topics: [{ topic: 'my-topic-3' }],
                    consumer: { groupId: 'keep-that-group-id' },
                    contentType: 'application/json',
                },
                'from-all-topics': {
                    kafka: 'default',
                    topics: [
                        { topic: 'my-topic-0' },
                        { topic: 'my-topic-1' },
                        { topic: 'my-topic-2' },
                        { topic: 'my-topic-3' },
                    ],
                    consumer: { groupId: 'my-service.from-all-topics' },
                },
                'from-all-again': {
                    kafka: 'default',
                    topics: [
                        { topic: 'my-topic-0' },
                        { topic: 'my-topic-1' },
                        { topic: 'my-topic-2' },
                        { topic: 'my-topic-3', alias: 'alias-to-my-topic-3' },
                    ],
                    consumer: { groupId: 'my-service.from-all-again' },
                },
            },
        });
    });

    it('should build config with default', () => {
        expect(
            buildConfig({
                namespace: 'my-service',
                defaults: {
                    producer: {
                        allowAutoTopicCreation: true,
                    },
                    consumer: {
                        groupId: 'this-will-be-overridden',
                        allowAutoTopicCreation: false,
                    },
                },
                config: {
                    clientId: 'my-super-client-id',
                    brokers: ['localhost:1'],
                },
                subscriptions: {
                    'from-topic1': 'my-topic-1',
                },
            })
        ).toEqual({
            namespace: 'my-service',
            kafka: {
                default: {
                    clientId: 'my-super-client-id',
                    brokers: ['localhost:1'],
                },
            },
            producers: {
                default: {
                    kafka: 'default',
                    producer: {
                        allowAutoTopicCreation: true,
                    },
                },
            },
            publications: {},
            subscriptions: {
                'from-topic1': {
                    kafka: 'default',
                    topics: [{ topic: 'my-topic-1' }],
                    consumer: {
                        groupId: 'my-service.from-topic1',
                        allowAutoTopicCreation: false,
                    },
                },
            },
        });
    });

    it('should build config from empty', () => {
        expect(
            buildConfig({
                namespace: 'my-service',
                config: {
                    brokers: ['localhost:1'],
                },
            })
        ).toEqual({
            namespace: 'my-service',
            kafka: {
                default: {
                    clientId: 'my-service',
                    brokers: ['localhost:1'],
                },
            },
            producers: {
                default: { kafka: 'default' },
            },
            publications: {},
            subscriptions: {},
        });
    });
});
