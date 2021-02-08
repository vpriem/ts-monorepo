import { v4 as uuid } from 'uuid';
import { Broker } from '..';

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
        const value1 = uuid();
        const value2 = uuid();

        const subscriptions = broker.subscriptionList();
        expect(subscriptions).toHaveLength(2);

        const promise = new Promise((resolve) => {
            const values: string[][] = [];
            subscriptions.on<string>('message', (value, message, topic) => {
                values.push([value, topic]);
                if (values.length >= 2) resolve(values);
            });
        });

        await subscriptions.runAll();

        await expect(
            broker.publish('to-topic1', { value: value1 })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(
            broker.publish('to-topic2', { value: value2 })
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(promise).resolves.toEqual([
            [value1, topic1],
            [value2, topic2],
        ]);
    });
});
