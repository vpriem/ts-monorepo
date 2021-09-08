import { v4 as uuid } from 'uuid';
import { Broker } from '..';

describe('error+handling', () => {
    const topic1 = uuid();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': topic1,
        },
        subscriptions: {
            'from-topic1': {
                topics: [topic1],
                handler: () => Promise.reject(new Error('Sorry')),
            },
        },
    });

    afterAll(() => broker.shutdown());

    it('should catch error', async () => {
        const value = uuid();
        const brokerError = new Promise((resolve) =>
            broker.once('error', resolve)
        );
        const subscription = broker.subscription('from-topic1');
        const subscriptionError = new Promise((resolve) =>
            subscription.once('error', resolve)
        );

        await subscription.run();

        await expect(
            broker.publish('to-topic1', [{ value }])
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(brokerError).resolves.toThrow('Sorry');
        await expect(subscriptionError).resolves.toThrow('Sorry');
    });
});
