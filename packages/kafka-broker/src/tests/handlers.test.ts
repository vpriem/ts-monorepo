import { v4 as uuid } from 'uuid';
import { Broker, Handler, getMessage } from '..';

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
        const value1 = uuid();
        const value2 = uuid();
        const subscription = broker.subscription('from-all-topics');

        const messages = getMessage(subscription, 2);

        await subscription.run();

        await expect(
            broker.publish('to-topic1', { value: value1 })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(
            broker.publish('to-topic2', { value: value2 })
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(messages).resolves.toEqual(
            expect.arrayContaining([
                [value1, expect.objectContaining({ topic: topic1 })],
                [value2, expect.objectContaining({ topic: topic2 })],
            ])
        );

        expect(handler).toHaveBeenCalledWith(
            value1,
            expect.objectContaining({ topic: topic1 })
        );

        expect(handler).toHaveBeenCalledWith(
            value2,
            expect.objectContaining({ topic: topic2 })
        );

        expect(handlerOfTopic1).toHaveBeenCalledWith(
            value1,
            expect.objectContaining({ topic: topic1 })
        );

        expect(handlerOfTopic2).toHaveBeenCalledWith(
            value2,
            expect.objectContaining({ topic: topic2 })
        );
    });
});
