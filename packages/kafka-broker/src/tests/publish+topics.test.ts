import { v4 as uuid } from 'uuid';
import { Broker, getMessage } from '..';

describe('publish+topics', () => {
    const topic1 = uuid();
    const topic2 = uuid();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topics': [topic1, topic2],
        },
        subscriptions: {
            'from-topics': [topic1, topic2],
        },
    });

    afterAll(() => broker.shutdown());

    it('should publish to multiple topics', async () => {
        const value = uuid();
        const subscription = broker.subscription('from-topics');
        const messages = getMessage(subscription, 2);

        await subscription.run();

        await expect(
            broker.publish('to-topics', { value })
        ).resolves.toMatchObject([
            { topicName: topic1 },
            { topicName: topic2 },
        ]);

        await expect(messages).resolves.toEqual(
            expect.arrayContaining([
                [
                    value,
                    expect.objectContaining({
                        message: expect.objectContaining({
                            headers: {
                                'content-type': Buffer.from('text/plain'),
                            },
                        }) as object,
                        topic: topic1,
                    }),
                    expect.any(Function),
                ],
                [
                    value,
                    expect.objectContaining({
                        message: expect.objectContaining({
                            headers: {
                                'content-type': Buffer.from('text/plain'),
                            },
                        }) as object,
                        topic: topic2,
                    }),
                    expect.any(Function),
                ],
            ])
        );
    });
});
