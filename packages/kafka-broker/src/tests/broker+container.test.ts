import { v4 as uuid } from 'uuid';
import { BrokerContainer, BrokerError, ConsumeMessage } from '..';

interface Event {
    id: number;
}

describe('broker+container', () => {
    const topic1 = uuid();
    const topic2 = uuid();
    const broker = new BrokerContainer({
        namespace: uuid(),
        brokers: {
            public: {
                config: {
                    brokers: [process.env.KAFKA_BROKER as string],
                },
                publications: {
                    'to-topic1': topic1,
                },
                subscriptions: {
                    'from-topic1': topic1,
                },
            },
            private: {
                config: {
                    brokers: [process.env.KAFKA_BROKER as string],
                },
                publications: {
                    'to-topic2': topic2,
                },
                subscriptions: {
                    'from-topic2': topic2,
                },
            },
        },
    });

    afterAll(() => broker.shutdown());

    it('should throw BrokerError', async () => {
        await expect(broker.publish('foo/bar', { value: 'a' })).rejects.toThrow(
            new BrokerError('Unknown broker "foo"')
        );

        expect(() => broker.subscription('foo/bar')).toThrow(
            new BrokerError('Unknown broker "foo"')
        );
    });

    it('should publish and consume from all brokers', async () => {
        const values: number[] = [];

        const subscriptions = broker.subscriptionList();
        expect(subscriptions).toHaveLength(2);

        const promise = new Promise((resolve) => {
            subscriptions.on('message', (message: ConsumeMessage<Event>) => {
                values.push(message.value.id);
                if (values.length >= 2) resolve(values);
            });
        });

        await subscriptions.runAll();

        await expect(
            broker.publish<Event>('public/to-topic1', { value: { id: 1 } })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(
            broker.publish<Event>('private/to-topic2', { value: { id: 2 } })
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(promise).resolves.toEqual(expect.arrayContaining([1, 2]));
    });
});
