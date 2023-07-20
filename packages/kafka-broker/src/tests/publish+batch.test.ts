import { v4 as uuid } from 'uuid';
import { Broker, getMessage } from '..';

interface Event {
    id: string;
}

describe('publish+batch', () => {
    const topic1 = uuid();
    const topic2 = uuid();
    const topic3 = uuid();
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
    });

    afterAll(() => broker.shutdown());

    it('should batch publish and consume', async () => {
        const id1 = uuid();
        const id2 = uuid();
        const id3 = uuid();
        const id4 = uuid();
        const subscription = broker.subscription('from-topic1');
        const messages = getMessage(subscription, 4);

        await subscription.run();

        await expect(
            broker.publish<Event>('to-topic1', { value: { id: id1 } })
        ).resolves.toBeNull();
        await expect(
            broker.publish<Event>('to-topic1', { value: { id: id2 } })
        ).resolves.toBeNull();
        await expect(
            broker.publish<Event>('to-topic1', { value: { id: id3 } })
        ).resolves.toBeNull();
        await expect(
            broker.publish<Event>('to-topic1', { value: { id: id4 } })
        ).resolves.toBeNull();

        const expectedMessage = expect.objectContaining({
            headers: { 'content-type': Buffer.from('application/json') },
        }) as object;

        await expect(messages).resolves.toEqual(
            expect.arrayContaining([
                [
                    { id: id1 },
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic1,
                    }),
                    expect.any(Function),
                ],
                [
                    { id: id2 },
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic1,
                    }),
                    expect.any(Function),
                ],
                [
                    { id: id3 },
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic1,
                    }),
                    expect.any(Function),
                ],
                [
                    { id: id4 },
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic1,
                    }),
                    expect.any(Function),
                ],
            ])
        );
    });

    it('should batch publish and consume from multiple topics', async () => {
        const id1 = uuid();
        const id2 = uuid();
        const id3 = uuid();
        const id4 = uuid();
        const subscription = broker.subscription('from-topic2-3');
        const messages = getMessage(subscription, 8);

        await subscription.run();

        await expect(
            broker.publish<Event>('to-topic2-3', { value: { id: id1 } })
        ).resolves.toBeNull();
        await expect(
            broker.publish<Event>('to-topic2-3', { value: { id: id2 } })
        ).resolves.toBeNull();
        await expect(
            broker.publish<Event>('to-topic2-3', { value: { id: id3 } })
        ).resolves.toBeNull();
        await expect(
            broker.publish<Event>('to-topic2-3', { value: { id: id4 } })
        ).resolves.toBeNull();

        const expectedMessage = expect.objectContaining({
            headers: { 'content-type': Buffer.from('application/json') },
        }) as object;

        await expect(messages).resolves.toEqual(
            expect.arrayContaining([
                [
                    { id: id1 },
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic2,
                    }),
                    expect.any(Function),
                ],
                [
                    { id: id1 },
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic3,
                    }),
                    expect.any(Function),
                ],
                [
                    { id: id2 },
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic2,
                    }),
                    expect.any(Function),
                ],
                [
                    { id: id2 },
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic3,
                    }),
                    expect.any(Function),
                ],
                [
                    { id: id3 },
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic2,
                    }),
                    expect.any(Function),
                ],
                [
                    { id: id3 },
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic3,
                    }),
                    expect.any(Function),
                ],
                [
                    { id: id4 },
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic2,
                    }),
                    expect.any(Function),
                ],
                [
                    { id: id4 },
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic3,
                    }),
                    expect.any(Function),
                ],
            ])
        );
    });
});
