import { v4 as uuid } from 'uuid';
import { Broker } from '..';

describe('error+handling', () => {
    const topic1 = uuid();
    const topic2 = uuid();
    const topic3 = uuid();
    const broker = new Broker({
        namespace: uuid(),
        defaults: {
            consumer: {
                retry: {
                    retries: 0,
                    restartOnFailure: () => Promise.resolve(false),
                },
            },
        },
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
                handler: () => Promise.reject(new Error('Sorry')),
            },
            'from-topic2': {
                topics: [topic2],
                contentType: 'application/json',
            },
            'from-topic3': {
                topics: [topic3],
                contentType: 'application/schema-registry',
            },
        },
    });

    afterEach(() => broker.shutdown());

    it('should catch error', async () => {
        const value = uuid();
        const brokerError = new Promise((resolve) => {
            broker.once('error', resolve);
        });
        const subscription = broker.subscription('from-topic1');
        const subscriptionError = new Promise((resolve) => {
            subscription.once('error', resolve);
        });

        await subscription.run();

        await expect(
            broker.publish('to-topic1', [{ value }])
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(brokerError).resolves.toThrow('Sorry');
        await expect(subscriptionError).resolves.toThrow('Sorry');
    });

    it('should catch json error', async () => {
        const brokerError = new Promise((resolve) => {
            broker.once('error', resolve);
        });
        const subscription = broker.subscription('from-topic2');
        const subscriptionError = new Promise((resolve) => {
            subscription.once('error', resolve);
        });

        await subscription.run();

        await expect(
            broker.publish('to-topic2', [{ value: uuid() }])
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(brokerError).resolves.toThrow(/JSON/);
        await expect(subscriptionError).resolves.toThrow(/JSON/);
    });

    it('should catch registry error', async () => {
        const brokerError = new Promise((resolve) => {
            broker.once('error', resolve);
        });
        const subscription = broker.subscription('from-topic3');
        const subscriptionError = new Promise((resolve) => {
            subscription.once('error', resolve);
        });

        await subscription.run();

        await expect(
            broker.publish('to-topic3', [{ value: uuid() }])
        ).resolves.toMatchObject([{ topicName: topic3 }]);

        await expect(brokerError).resolves.toThrow('Registry not found');
        await expect(subscriptionError).resolves.toThrow('Registry not found');
    });
});
