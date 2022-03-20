import { v4 as uuid } from 'uuid';
import { Broker, getMessage } from '..';

describe('dead+letter', () => {
    const topic = uuid();
    const dlx = uuid();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic': topic,
            'to-topic-dlx': dlx,
        },
        subscriptions: {
            'from-topic': {
                topics: [topic],
                contentType: 'application/json',
                deadLetter: 'to-topic-dlx',
            },
            'from-topic-dlx': {
                topics: [dlx],
            },
        },
    });

    afterAll(() => broker.shutdown());

    it('should end up in dead letter topic', async () => {
        const subscription = broker.subscription('from-topic');
        const subscriptionDlt = broker.subscription('from-topic-dlx');
        const message = getMessage(subscriptionDlt);

        await subscription.run();
        await subscriptionDlt.run();

        await expect(
            broker.publish('to-topic', [{ value: uuid() }])
        ).resolves.toMatchObject([{ topicName: topic }]);

        await expect(message).resolves.toEqual([
            expect.objectContaining({
                error: expect.stringContaining('Unexpected token') as string,
                message: expect.any(Object) as object,
                topic,
            }),
            expect.objectContaining({
                message: expect.objectContaining({
                    headers: {
                        'content-type': Buffer.from('application/json'),
                    },
                }) as object,
                topic: dlx,
            }),
            expect.any(Function),
        ]);
    });
});
