import { v4 as uuid } from 'uuid';
import { Broker, getMessage } from '..';

describe('broker+container', () => {
    const namespace = uuid();
    const topic1 = uuid();
    const topic2 = uuid();
    const broker = new Broker({
        namespace,
        brokers: {
            public: {
                config: {
                    brokers: [process.env.KAFKA_BROKER as string],
                },
                publications: {
                    'to-topic1': topic1,
                },
                subscriptions: {
                    'from-topic1': topic1,
                },
            },
            private: {
                config: {
                    brokers: [process.env.KAFKA_BROKER as string],
                },
                publications: {
                    'to-topic2': topic2,
                },
                subscriptions: {
                    'from-topic2': topic2,
                },
            },
        },
    });

    afterAll(() => broker.shutdown());

    it('should publish and consume from all brokers', async () => {
        const value1 = uuid();
        const value2 = uuid();

        const subscriptions = broker.subscriptionList();
        expect(subscriptions).toHaveLength(2);
        const messages = getMessage(subscriptions, 2);

        await subscriptions.run();

        await expect(
            broker.publish('public/to-topic1', { value: value1 })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(
            broker.publish('private/to-topic2', { value: value2 })
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(messages).resolves.toEqual(
            expect.arrayContaining([
                [
                    value1,
                    expect.objectContaining({ topic: topic1 }),
                    expect.any(Function),
                ],
                [
                    value2,
                    expect.objectContaining({ topic: topic2 }),
                    expect.any(Function),
                ],
            ])
        );
    });

    it('should consume and publish from one broker to another', async () => {
        const value1 = uuid();
        const value2 = uuid();

        await broker
            .subscription('public/from-topic1')
            .on('message', async (value, payload, publish) => {
                await publish('private/to-topic2', { value: value2 });
            })
            .run();

        const subscription = broker.subscription('private/from-topic2');

        const message = getMessage(subscription);

        await subscription.run();

        await expect(
            broker.publish('public/to-topic1', { value: value1 })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(message).resolves.toEqual([
            value2,
            expect.objectContaining({ topic: topic2 }),
            expect.any(Function),
        ]);
    });
});
