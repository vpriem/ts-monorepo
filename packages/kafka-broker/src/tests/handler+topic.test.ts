import { v4 as uuid } from 'uuid';
import { Broker, Handler, getMessage } from '..';

describe('handlers', () => {
    const topic1 = uuid();
    const topic2 = uuid();
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
            'from-all-topics': [
                topic1,
                {
                    topic: topic2,
                    alias: 'topic2',
                },
            ],
        },
    });

    afterAll(() => broker.shutdown());

    it('should call handler', async () => {
        const value1 = uuid();
        const value2 = uuid();
        const value3 = uuid();
        const handler: Handler = jest.fn();
        const handlerOfTopic1: Handler = jest.fn();
        const handlerOfTopic2: Handler = jest.fn();
        const subscription = broker.subscription('from-all-topics');
        const messages1 = getMessage(subscription, 2);

        await subscription
            .on('message', handler)
            .on(`message.${topic1}`, handlerOfTopic1)
            .on(`message.topic2`, handlerOfTopic2)
            .run();

        await expect(
            broker.publish('to-topic1', { value: value1 })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(
            broker.publish('to-topic2', { value: value2 })
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(messages1).resolves.toEqual(
            expect.arrayContaining([
                [
                    value1,
                    expect.objectContaining({ topic: topic1 }),
                    expect.any(Function),
                ],
                [
                    value2,
                    expect.objectContaining({ topic: topic2 }),
                    expect.any(Function),
                ],
            ])
        );

        expect(handler).toHaveBeenCalledWith(
            value1,
            expect.objectContaining({ topic: topic1 }),
            expect.any(Function)
        );

        expect(handler).toHaveBeenCalledWith(
            value2,
            expect.objectContaining({ topic: topic2 }),
            expect.any(Function)
        );

        expect(handlerOfTopic1).toHaveBeenCalledWith(
            value1,
            expect.objectContaining({ topic: topic1 }),
            expect.any(Function)
        );

        expect(handlerOfTopic2).toHaveBeenCalledWith(
            value2,
            expect.objectContaining({ topic: topic2 }),
            expect.any(Function)
        );

        subscription.off(`message.${topic1}`, handlerOfTopic1);
        subscription.off(`message.topic2`, handlerOfTopic2);
        const messages2 = getMessage(subscription, 2);

        await expect(
            broker.publish('to-topic1', { value: value3 })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(
            broker.publish('to-topic2', { value: value3 })
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(messages2).resolves.toEqual(
            expect.arrayContaining([
                [
                    value3,
                    expect.objectContaining({ topic: topic1 }),
                    expect.any(Function),
                ],
                [
                    value3,
                    expect.objectContaining({ topic: topic2 }),
                    expect.any(Function),
                ],
            ])
        );

        expect(handler).toHaveBeenCalledWith(
            value3,
            expect.objectContaining({ topic: topic1 }),
            expect.any(Function)
        );

        expect(handler).toHaveBeenCalledWith(
            value3,
            expect.objectContaining({ topic: topic2 }),
            expect.any(Function)
        );

        expect(handlerOfTopic1).not.toHaveBeenCalledWith(
            value3,
            expect.objectContaining({ topic: topic1 }),
            expect.any(Function)
        );

        expect(handlerOfTopic2).not.toHaveBeenCalledWith(
            value3,
            expect.objectContaining({ topic: topic2 }),
            expect.any(Function)
        );
    });
});
