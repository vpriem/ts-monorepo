import { v4 as uuid } from 'uuid';
import { Broker } from '..';

describe('publish+null', () => {
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
        const subscription = broker.subscription('from-topic1');

        const promise = new Promise((resolve) => {
            subscription.on('message', (value) => {
                resolve(value);
            });
        });

        await subscription.run();

        await expect(
            broker.publish('to-topic1', { value: null })
        ).resolves.toMatchObject([{ topicName: topic }]);

        await expect(promise).resolves.toBeNull();
    });
});
