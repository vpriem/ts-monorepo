import { v4 as uuid } from 'uuid';
import { Broker, Handler } from '..';

interface Event {
    id: number;
}

describe('handlers', () => {
    const topic1 = uuid();
    const topic2 = uuid();
    const handler: Handler = jest.fn();
    const handlerOfTopic1: Handler = jest.fn();
    const handlerOfTopic2: Handler = jest.fn();
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
            'from-all-topics': {
                topics: [
                    {
                        topic: topic1,
                        handler: handlerOfTopic1,
                    },
                    {
                        topic: topic2,
                        handler: handlerOfTopic2,
                    },
                ],
                handler,
            },
        },
    });

    afterAll(() => broker.shutdown());

    it('should call handler', async () => {
        let calls = 0;
        const subscription = broker.subscription('from-all-topics');

        const promise = new Promise((resolve) => {
            subscription.on('message', () => {
                calls += 1;
                if (calls >= 2) resolve(calls);
            });
        });

        await subscription.run();

        await expect(
            broker.publish<Event>('to-topic1', { value: { id: 123 } })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(
            broker.publish<Event>('to-topic2', { value: { id: 321 } })
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(promise).resolves.toBe(2);

        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({ value: { id: 123 } }),
            expect.objectContaining({ topic: topic1 })
        );

        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({ value: { id: 321 } }),
            expect.objectContaining({ topic: topic2 })
        );

        expect(handlerOfTopic1).toHaveBeenCalledWith(
            expect.objectContaining({ value: { id: 123 } }),
            expect.objectContaining({ topic: topic1 })
        );

        expect(handlerOfTopic2).toHaveBeenCalledWith(
            expect.objectContaining({ value: { id: 321 } }),
            expect.objectContaining({ topic: topic2 })
        );
    });
});
