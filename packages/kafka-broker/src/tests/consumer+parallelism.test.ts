import { v4 as uuid } from 'uuid';
import { Broker, getMessage } from '..';

interface Event {
    id: string;
}

describe('consumer+parallelism', () => {
    const topic1 = uuid();
    const topic2 = uuid();
    const topic3 = uuid();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': topic1,
            'to-topic2': topic2,
            'to-topic3': topic3,
        },
        subscriptions: {
            'from-topic1': {
                topics: [topic1],
                parallelism: 'all-at-once',
            },
            'from-topic2': {
                topics: [topic2],
                parallelism: 'by-partition-key',
            },
            'from-topic3': {
                topics: [topic3],
            },
        },
    });

    afterAll(() => broker.shutdown());

    it('should consume async', async () => {
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

        await expect(messages).resolves.toEqual([
            [{ id: id1 }, expectedPayload, expect.any(Function)],
            [{ id: id2 }, expectedPayload, expect.any(Function)],
            [{ id: id3 }, expectedPayload, expect.any(Function)],
            [{ id: id4 }, expectedPayload, expect.any(Function)],
        ]);
    });

    it('should consume async by partition key', async () => {
        const key1 = uuid();
        const id1 = uuid();
        const id2 = uuid();
        const key2 = uuid();
        const id3 = uuid();
        const id4 = uuid();
        const id5 = uuid();
        const id6 = uuid();
        const subscription = broker.subscription('from-topic2');
        const messages = getMessage(subscription, 6);

        await subscription.run();

        await expect(
            broker.publish<Event>('to-topic2', [
                { key: key1, value: { id: id1 } },
                { key: key1, value: { id: id2 } },
                { key: key2, value: { id: id3 } },
                { key: key2, value: { id: id4 } },
                { value: { id: id5 } },
                { value: { id: id6 } },
            ])
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        const expectedPayload = expect.objectContaining({
            message: expect.objectContaining({
                headers: { 'content-type': Buffer.from('application/json') },
            }) as object,
            topic: topic2,
        }) as object;

        await expect(messages).resolves.toEqual([
            [{ id: id1 }, expectedPayload, expect.any(Function)],
            [{ id: id3 }, expectedPayload, expect.any(Function)],
            [{ id: id5 }, expectedPayload, expect.any(Function)],
            [{ id: id2 }, expectedPayload, expect.any(Function)],
            [{ id: id4 }, expectedPayload, expect.any(Function)],
            [{ id: id6 }, expectedPayload, expect.any(Function)],
        ]);
    });

    it('should consume sync', async () => {
        const id1 = uuid();
        const id2 = uuid();
        const id3 = uuid();
        const id4 = uuid();
        const subscription = broker.subscription('from-topic3');
        const messages = getMessage(subscription, 4);

        await subscription.run();

        await expect(
            broker.publish<Event>('to-topic3', [
                { value: { id: id1 } },
                { value: { id: id2 } },
                { value: { id: id3 } },
                { value: { id: id4 } },
            ])
        ).resolves.toMatchObject([{ topicName: topic3 }]);

        const expectedPayload = expect.objectContaining({
            message: expect.objectContaining({
                headers: { 'content-type': Buffer.from('application/json') },
            }) as object,
            topic: topic3,
        }) as object;

        await expect(messages).resolves.toEqual([
            [{ id: id1 }, expectedPayload, expect.any(Function)],
            [{ id: id2 }, expectedPayload, expect.any(Function)],
            [{ id: id3 }, expectedPayload, expect.any(Function)],
            [{ id: id4 }, expectedPayload, expect.any(Function)],
        ]);
    });
});
