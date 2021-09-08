import { v4 as uuid } from 'uuid';
import { Broker, getMessage } from '..';

interface Event {
    id: string;
}

describe('json+support', () => {
    const topic1 = uuid();
    const topic2 = uuid();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': topic1,
            'to-topic2': topic2,
        },
        subscriptions: {
            'from-topic1': topic1,
            'from-topic2': {
                topics: [topic2],
                contentType: 'application/json',
            },
        },
    });

    afterAll(() => broker.shutdown());

    it('should publish and consume json messages', async () => {
        const id1 = uuid();
        const id2 = uuid();
        const id3 = uuid();
        const id4 = uuid();
        const subscription = broker.subscription('from-topic1');
        const messages = getMessage(subscription, 4);

        await subscription.run();

        await expect(
            broker.publish<Event>('to-topic1', [
                { value: { id: id1 } },
                { value: { id: id2 } },
                { value: { id: id3 } },
                { value: { id: id4 } },
            ])
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        const expectedPayload = expect.objectContaining({
            message: expect.objectContaining({
                headers: { 'content-type': Buffer.from('application/json') },
            }) as object,
            topic: topic1,
        }) as object;

        await expect(messages).resolves.toEqual(
            expect.arrayContaining([
                [{ id: id1 }, expectedPayload, expect.any(Function)],
                [{ id: id2 }, expectedPayload, expect.any(Function)],
                [{ id: id3 }, expectedPayload, expect.any(Function)],
                [{ id: id4 }, expectedPayload, expect.any(Function)],
            ])
        );
    });

    it('should force json consume', async () => {
        const id = uuid();
        const subscription = broker.subscription('from-topic2');
        const message = getMessage(subscription);

        await subscription.run();

        await expect(
            broker.publish('to-topic2', [{ value: JSON.stringify({ id }) }])
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(message).resolves.toEqual([
            { id },
            expect.objectContaining({
                message: expect.objectContaining({
                    headers: {
                        'content-type': Buffer.from('text/plain'),
                    },
                }) as object,
                topic: topic2,
            }),
            expect.any(Function),
        ]);
    });

    it('should emit error event', async () => {
        const brokerError = new Promise((resolve) =>
            broker.once('error', resolve)
        );
        const subscription = broker.subscription('from-topic2');
        const subscriptionError = new Promise((resolve) =>
            subscription.once('error', resolve)
        );

        await subscription.run();

        await expect(
            broker.publish('to-topic2', [{ value: uuid() }])
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(brokerError).resolves.toThrow(/JSON/);
        await expect(subscriptionError).resolves.toThrow(/JSON/);
    });
});
