import { v4 as uuid } from 'uuid';
import { Broker, getMessage } from '..';

describe('publish+batch', () => {
    const topic1 = uuid();
    const topic2 = uuid();
    const topic3 = uuid();
    const onBatchStart = jest.fn();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        defaults: {
            producer: {
                batch: {
                    size: 2,
                    lingerMs: 1,
                },
            },
        },
        publications: {
            'to-topic1': topic1,
            'to-topic2-3': [topic2, topic3],
        },
        subscriptions: {
            'from-topic1': topic1,
            'from-topic2-3': [topic2, topic3],
        },
    }).on('producer.batch.start', onBatchStart);

    afterAll(() => broker.shutdown());

    it('should batch publish and consume', async () => {
        const value1 = uuid();
        const value2 = uuid();
        const value3 = uuid();
        const value4 = uuid();
        const subscription = broker.subscription('from-topic1');
        const messages = getMessage(subscription, 4);

        await subscription.run();

        await expect(
            broker.publish('to-topic1', { value: value1 })
        ).resolves.toBeNull();
        await expect(
            broker.publish('to-topic1', { value: value2 })
        ).resolves.toBeNull();
        await expect(
            broker.publish('to-topic1', { value: value3 })
        ).resolves.toBeNull();
        await expect(
            broker.publish('to-topic1', { value: value4 })
        ).resolves.toBeNull();

        const expectedMessage = expect.objectContaining({
            headers: { 'content-type': Buffer.from('text/plain') },
        }) as object;

        await expect(messages).resolves.toEqual(
            expect.arrayContaining([
                [
                    value1,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic1,
                    }),
                    expect.any(Function),
                ],
                [
                    value2,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic1,
                    }),
                    expect.any(Function),
                ],
                [
                    value3,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic1,
                    }),
                    expect.any(Function),
                ],
                [
                    value4,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic1,
                    }),
                    expect.any(Function),
                ],
            ])
        );

        expect(onBatchStart).toHaveBeenCalledTimes(2);
        expect(onBatchStart).toHaveBeenCalledWith({
            topicMessages: [
                {
                    topic: topic1,
                    messages: [
                        expect.objectContaining({ value: value1 }),
                        expect.objectContaining({ value: value2 }),
                    ],
                },
            ],
        });
        expect(onBatchStart).toHaveBeenCalledWith({
            topicMessages: [
                {
                    topic: topic1,
                    messages: [
                        expect.objectContaining({ value: value3 }),
                        expect.objectContaining({ value: value4 }),
                    ],
                },
            ],
        });
    });

    it('should batch publish and consume from multiple topics', async () => {
        const value1 = uuid();
        const value2 = uuid();
        const value3 = uuid();
        const value4 = uuid();
        const subscription = broker.subscription('from-topic2-3');
        const messages = getMessage(subscription, 8);

        await subscription.run();

        await expect(
            broker.publish('to-topic2-3', { value: value1 })
        ).resolves.toBeNull();
        await expect(
            broker.publish('to-topic2-3', { value: value2 })
        ).resolves.toBeNull();
        await expect(
            broker.publish('to-topic2-3', { value: value3 })
        ).resolves.toBeNull();
        await expect(
            broker.publish('to-topic2-3', { value: value4 })
        ).resolves.toBeNull();

        const expectedMessage = expect.objectContaining({
            headers: { 'content-type': Buffer.from('text/plain') },
        }) as object;

        await expect(messages).resolves.toEqual(
            expect.arrayContaining([
                [
                    value1,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic2,
                    }),
                    expect.any(Function),
                ],
                [
                    value1,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic3,
                    }),
                    expect.any(Function),
                ],
                [
                    value2,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic2,
                    }),
                    expect.any(Function),
                ],
                [
                    value2,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic3,
                    }),
                    expect.any(Function),
                ],
                [
                    value3,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic2,
                    }),
                    expect.any(Function),
                ],
                [
                    value3,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic3,
                    }),
                    expect.any(Function),
                ],
                [
                    value4,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic2,
                    }),
                    expect.any(Function),
                ],
                [
                    value4,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic3,
                    }),
                    expect.any(Function),
                ],
            ])
        );

        expect(onBatchStart).toHaveBeenCalledTimes(4);
        expect(onBatchStart).toHaveBeenCalledWith({
            topicMessages: [
                {
                    topic: topic2,
                    messages: [expect.objectContaining({ value: value1 })],
                },
                {
                    topic: topic3,
                    messages: [expect.objectContaining({ value: value1 })],
                },
            ],
        });
        expect(onBatchStart).toHaveBeenCalledWith({
            topicMessages: [
                {
                    topic: topic2,
                    messages: [expect.objectContaining({ value: value2 })],
                },
                {
                    topic: topic3,
                    messages: [expect.objectContaining({ value: value2 })],
                },
            ],
        });
        expect(onBatchStart).toHaveBeenCalledWith({
            topicMessages: [
                {
                    topic: topic2,
                    messages: [expect.objectContaining({ value: value3 })],
                },
                {
                    topic: topic3,
                    messages: [expect.objectContaining({ value: value3 })],
                },
            ],
        });
        expect(onBatchStart).toHaveBeenCalledWith({
            topicMessages: [
                {
                    topic: topic2,
                    messages: [expect.objectContaining({ value: value4 })],
                },
                {
                    topic: topic3,
                    messages: [expect.objectContaining({ value: value4 })],
                },
            ],
        });
    });
});
