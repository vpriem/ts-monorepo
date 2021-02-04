import { v4 as uuid } from 'uuid';
import { Broker } from '..';

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
                topics: topic2,
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
        const values: string[] = [];

        const subscription = broker.subscription('from-topic1');

        const promise = new Promise((resolve) => {
            subscription.on<Event>('message', (value, message, topic) => {
                expect(message.headers?.['content-type']?.toString()).toBe(
                    'application/json'
                );
                expect(topic).toBe(topic1);
                values.push(value.id);
                if (values.length >= 4) resolve(values);
            });
        });

        await subscription.run();

        await expect(
            broker.publish<Event>('to-topic1', [
                { value: { id: id1 } },
                { value: { id: id2 } },
                { value: { id: id3 } },
                { value: { id: id4 } },
            ])
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(promise).resolves.toEqual(
            expect.arrayContaining([id1, id2, id3, id4])
        );
    });

    it('should force json consume', async () => {
        const id = uuid();

        const subscription = broker.subscription('from-topic2');

        const promise = new Promise((resolve) => {
            subscription.on('message', (value, message, topic) => {
                expect(message.headers?.['content-type']).toBeUndefined();
                expect(topic).toBe(topic2);
                resolve(value);
            });
        });

        await subscription.run();

        await expect(
            broker.publish('to-topic2', [{ value: JSON.stringify({ id }) }])
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(promise).resolves.toEqual({ id });
    });

    it('should emit error event', async () => {
        broker.on('error', () => undefined);
        const promise = new Promise((resolve) => {
            broker.on('error', resolve);
        });

        await broker.subscription('from-topic2').run();

        await expect(
            broker.publish('to-topic2', [{ value: uuid() }])
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(promise).resolves.toThrow(/JSON/);
    });
});
