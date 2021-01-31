import { buildConfig } from '../buildConfig';

describe('config', () => {
    it('should build config', () => {
        expect(
            buildConfig({
                namespace: 'my-service',
                config: {
                    brokers: [process.env.KAFKA_BROKER as string],
                },
                producers: {
                    'my-producer-2': {
                        config: { allowAutoTopicCreation: false },
                    },
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
                    'from-topic1': {
                        topic: 'my-topic-1',
                        alias: 'alias-to-my-topic1',
                    },
                    'from-topic2': {
                        topics: [
                            {
                                topic: 'my-topic-2',
                                fromBeginning: true,
                            },
                        ],
                    },
                    'from-topic3': {
                        topics: 'my-topic-3',
                        consumer: { groupId: 'my-group-id-3' },
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
                        { topic: 'my-topic-3' },
                    ],
                },
            })
        ).toEqual({
            namespace: 'my-service',
            config: {
                clientId: 'my-service',
                brokers: [process.env.KAFKA_BROKER as string],
            },
            producers: {
                default: {},
                'my-producer-2': {
                    config: { allowAutoTopicCreation: false },
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
                    topics: [{ topic: 'my-topic-0' }],
                    consumer: { groupId: 'my-service.from-topic0' },
                },
                'from-topic1': {
                    topics: [
                        {
                            topic: 'my-topic-1',
                            alias: 'alias-to-my-topic1',
                        },
                    ],
                    consumer: { groupId: 'my-service.from-topic1' },
                },
                'from-topic2': {
                    topics: [
                        {
                            topic: 'my-topic-2',
                            fromBeginning: true,
                        },
                    ],
                    consumer: { groupId: 'my-service.from-topic2' },
                },
                'from-topic3': {
                    topics: [{ topic: 'my-topic-3' }],
                    consumer: { groupId: 'my-group-id-3' },
                },
                'from-all-topics': {
                    topics: [
                        { topic: 'my-topic-0' },
                        { topic: 'my-topic-1' },
                        { topic: 'my-topic-2' },
                        { topic: 'my-topic-3' },
                    ],
                    consumer: { groupId: 'my-service.from-all-topics' },
                },
                'from-all-again': {
                    topics: [
                        { topic: 'my-topic-0' },
                        { topic: 'my-topic-1' },
                        { topic: 'my-topic-2' },
                        { topic: 'my-topic-3' },
                    ],
                    consumer: { groupId: 'my-service.from-all-again' },
                },
            },
        });
    });

    it('should build config from empty', () => {
        expect(
            buildConfig({
                namespace: 'my-service',
                config: {
                    brokers: [process.env.KAFKA_BROKER as string],
                },
            })
        ).toEqual({
            namespace: 'my-service',
            config: {
                clientId: 'my-service',
                brokers: [process.env.KAFKA_BROKER as string],
            },
            producers: {
                default: {},
            },
            publications: {},
            subscriptions: {},
        });
    });
});
