import { v4 as uuid } from 'uuid';
import { Broker, getMessage } from '..';

describe('consumer+events', () => {
    const topic1 = uuid();
    const onConnect = jest.fn();
    const onDisconnect = jest.fn();
    const onRequest = jest.fn();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': topic1,
        },
        subscriptions: {
            'from-topic1': topic1,
        },
    })
        .on('consumer.connect', onConnect)
        .on('consumer.disconnect', onDisconnect)
        .on('consumer.network.request', onRequest);

    afterAll(() => broker.shutdown());

    it('should emit events', async () => {
        const value = uuid();

        const subscription = broker.subscription('from-topic1');
        const message = getMessage(subscription);

        expect(onConnect).not.toHaveBeenCalled();
        expect(onDisconnect).not.toHaveBeenCalled();
        expect(onRequest).not.toHaveBeenCalled();

        await subscription.run();

        expect(onConnect).toHaveBeenCalledTimes(2); // Kafkajs seems to call it twice
        expect(onDisconnect).not.toHaveBeenCalled();
        expect(onRequest).toHaveBeenCalled();

        await expect(
            broker.publish<string>('to-topic1', { value })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(message).resolves.toEqual([
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
        ]);

        await broker.shutdown();

        expect(onDisconnect).toHaveBeenCalledTimes(1);
    });
});
