import { v4 as uuid } from 'uuid';
import { Broker, Handler, getMessage } from '..';

describe('handler+publish', () => {
    const topic1 = uuid();
    const topic2 = uuid();
    const handler: Handler = async (value, payload, publish): Promise<void> => {
        await publish('to-topic2', { value });
    };
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': topic1,
            'to-topic2': topic2,
        },
        subscriptions: {
            'from-topic1': {
                topics: [topic1],
                handler,
            },
            'from-topic2': topic2,
        },
    });

    afterAll(() => broker.shutdown());

    it('should publish from handler', async () => {
        const value = uuid();
        const subscriptions = broker.subscriptionList();
        const messages = getMessage(subscriptions, 2);

        await subscriptions.run();

        await expect(
            broker.publish('to-topic1', { value })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(messages).resolves.toEqual(
            expect.arrayContaining([
                [
                    value,
                    expect.objectContaining({ topic: topic1 }),
                    expect.any(Function),
                ],
                [
                    value,
                    expect.objectContaining({ topic: topic2 }),
                    expect.any(Function),
                ],
            ])
        );
    });
});
