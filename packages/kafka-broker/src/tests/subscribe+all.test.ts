import { v4 as uuid } from 'uuid';
import { Broker } from '..';

interface Event {
    id: number;
}

describe('subscribe+all', () => {
    const topic1 = uuid();
    const topic2 = uuid();
    const broker = new Broker({
        namespace: 'service1',
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': topic1,
            'to-topic2': topic2,
        },
        subscriptions: {
            'from-topic1': topic1,
            'from-topic2': topic2,
        },
    });

    afterAll(() => broker.shutdown());

    it('should publish and consume from all', async () => {
        const values: number[] = [];

        const subscriptions = broker.subscriptionList();
        expect(subscriptions).toHaveLength(2);

        const promise = new Promise((resolve) => {
            subscriptions.on<Event>('message', (value) => {
                values.push(value.id);
                if (values.length >= 2) resolve(values);
            });
        });

        await subscriptions.runAll();

        await expect(
            broker.publish<Event>('to-topic1', { value: { id: 1 } })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(
            broker.publish<Event>('to-topic2', { value: { id: 2 } })
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(promise).resolves.toEqual(expect.arrayContaining([1, 2]));
    });
});
