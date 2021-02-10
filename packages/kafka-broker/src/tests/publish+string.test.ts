import { v4 as uuid } from 'uuid';
import { Broker, getMessage } from '..';

describe('publish+string', () => {
    const topic = uuid();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': topic,
        },
        subscriptions: {
            'from-topic1': topic,
        },
    });

    afterAll(() => broker.shutdown());

    it('should publish and consume', async () => {
        const value = uuid();
        const subscription = broker.subscription('from-topic1');

        const message = getMessage(subscription);

        await subscription.run();

        await expect(
            broker.publish('to-topic1', { value })
        ).resolves.toMatchObject([{ topicName: topic }]);

        await expect(message).resolves.toEqual([
            value,
            expect.objectContaining({ topic }),
        ]);
    });
});
