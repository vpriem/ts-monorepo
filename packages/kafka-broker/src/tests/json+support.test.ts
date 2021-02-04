import { v4 as uuid } from 'uuid';
import { Broker } from '..';

interface Event {
    id: number;
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
        const values: number[] = [];

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
                { value: { id: 1 } },
                { value: { id: 2 } },
                { value: { id: 3 } },
                { value: { id: 4 } },
            ])
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(promise).resolves.toEqual(
            expect.arrayContaining([1, 2, 3, 4])
        );
    });

    it('should force json consume', async () => {
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
            broker.publish('to-topic2', [
                { value: JSON.stringify({ id: 178 }) },
            ])
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(promise).resolves.toEqual({ id: 178 });
    });
});
