import { v4 as uuid } from 'uuid';
import { Broker, getMessage } from '..';

describe('publish+topics', () => {
    const topic1 = uuid();
    const topic2 = uuid();
    const onBatchStart = jest.fn();
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
    }).on('producer.batch.start', onBatchStart);

    afterAll(() => broker.shutdown());

    it('should publish to multiple topics', async () => {
        const value = uuid();
        const subscription = broker.subscription('from-topics');
        const messages = getMessage(subscription, 2);

        await subscription.run();

        await expect(broker.publish('to-topics', { value })).resolves.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ topicName: topic1 }),
                expect.objectContaining({ topicName: topic2 }),
            ])
        );

        const expectedMessage = expect.objectContaining({
            headers: {
                'content-type': Buffer.from('text/plain'),
            },
        }) as object;

        await expect(messages).resolves.toEqual(
            expect.arrayContaining([
                [
                    value,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic1,
                    }),
                    expect.any(Function),
                ],
                [
                    value,
                    expect.objectContaining({
                        message: expectedMessage,
                        topic: topic2,
                    }),
                    expect.any(Function),
                ],
            ])
        );

        expect(onBatchStart).toHaveBeenCalledTimes(1);
        expect(onBatchStart).toHaveBeenCalledWith({
            topicMessages: [
                {
                    topic: topic1,
                    messages: [expect.objectContaining({ value })],
                },
                {
                    topic: topic2,
                    messages: [expect.objectContaining({ value })],
                },
            ],
        });
    });
});
