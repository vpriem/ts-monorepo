import { Partitioners } from 'kafkajs';
import { buildConfig } from '../buildConfig';

const { LegacyPartitioner, DefaultPartitioner } = Partitioners;

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
                    'my-producer-2': {
                        createPartitioner: LegacyPartitioner,
                        allowAutoTopicCreation: false,
                        batch: { size: 50, lingerMs: 100 },
                    },
                },
                publications: {
                    'to-topic1': 'my-topic-1',
                    'to-topic2': {
                        topic: 'my-topic-2',
                        producer: 'my-producer-2',
                        schema: 2,
                    },
                    'to-topic3': {
                        topic: 'my-topic-2',
                        producer: 'my-producer-2',
                        schema: 'subject-3',
                    },
                    'to-topic4': ['my-topic-4.1', 'my-topic-4.2'],
                },
                subscriptions: {
                    'from-topic0': 'my-topic-0',
                    'from-topic1': [
                        'my-topic-1.0',
                        {
                            topic: 'my-topic-1.1',
                            alias: 'alias-to-my-topic1',
                            handler: async () => Promise.resolve(),
                        },
                    ],
                    'from-topic2': {
                        topics: [
                            {
                                topic: 'my-topic-2',
                                fromBeginning: true,
                            },
                        ],
                        handler: async () => Promise.resolve(),
                        deadLetter: 'dead-letter-topic-2',
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
                    producer: { createPartitioner: DefaultPartitioner },
                },
                'my-producer-2': {
                    kafka: 'default',
                    producer: {
                        createPartitioner: LegacyPartitioner,
                        allowAutoTopicCreation: false,
                    },
                    batch: { size: 50, lingerMs: 100 },
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
                    schema: { id: 2 },
                },
                'to-topic3': {
                    topic: 'my-topic-2',
                    producer: 'my-producer-2',
                    schema: {
                        subject: 'subject-3',
                        version: 'latest',
                    },
                },
                'to-topic4': {
                    topic: ['my-topic-4.1', 'my-topic-4.2'],
                    producer: 'default',
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
                            handler: expect.any(Function) as Function,
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
                    handler: expect.any(Function) as Function,
                    deadLetter: 'dead-letter-topic-2',
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

    it('should build config with defaults', () => {
        expect(
            buildConfig({
                namespace: 'my-service',
                defaults: {
                    producer: {
                        allowAutoTopicCreation: true,
                        createPartitioner: LegacyPartitioner,
                        batch: { size: 50, lingerMs: 100 },
                    },
                    consumer: {
                        groupId: 'this-will-be-overridden',
                        allowAutoTopicCreation: false,
                    },
                },
                producers: {
                    keep: {
                        allowAutoTopicCreation: false,
                        batch: { size: 100, lingerMs: 200 },
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
                        createPartitioner: LegacyPartitioner,
                        allowAutoTopicCreation: true,
                    },
                    batch: { size: 50, lingerMs: 100 },
                },
                keep: {
                    kafka: 'default',
                    producer: {
                        createPartitioner: LegacyPartitioner,
                        allowAutoTopicCreation: false,
                    },
                    batch: { size: 100, lingerMs: 200 },
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
                default: {
                    kafka: 'default',
                    producer: { createPartitioner: DefaultPartitioner },
                },
            },
            publications: {},
            subscriptions: {},
        });
    });
});
