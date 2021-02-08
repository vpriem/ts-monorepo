import { v4 as uuid } from 'uuid';
import { Broker, getMessage } from '..';

describe('publish+config', () => {
    const key1 = uuid();
    const key2 = uuid();
    const topic = uuid();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': {
                topic,
                messageConfig: { key: key1 },
            },
        },
        subscriptions: {
            'from-topic1': {
                topics: [{ topic, fromBeginning: true }],
            },
        },
    });

    afterAll(() => broker.shutdown());

    it('should publish and consume with config', async () => {
        const value1 = uuid();
        const value2 = uuid();

        await expect(
            broker.publish('to-topic1', [
                { value: value1 },
                { key: key2, value: value2 },
            ])
        ).resolves.toMatchObject([{ topicName: topic }]);

        const subscription = broker.subscription('from-topic1');

        const messages = getMessage(subscription, 2);

        await subscription.run();

        await expect(messages).resolves.toEqual([
            [
                value1,
                expect.objectContaining({ key: Buffer.from(key1) }),
                topic,
                expect.any(Number),
            ],
            [
                value2,
                expect.objectContaining({ key: Buffer.from(key2) }),
                topic,
                expect.any(Number),
            ],
        ]);
    });
});
