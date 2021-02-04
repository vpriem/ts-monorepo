import { v4 as uuid } from 'uuid';
import { Broker, BrokerError } from '..';

describe('broker', () => {
    const topic = uuid();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': topic,
            'to-topic-foo': {
                topic,
                producer: 'foo',
            },
        },
        subscriptions: {
            'from-topic1': {
                topics: topic,
                contentType: 'application/json',
            },
        },
    });

    afterAll(() => broker.shutdown());

    it('should throw BrokerError', async () => {
        await expect(broker.publish('foo', { value: 'a' })).rejects.toThrow(
            new BrokerError('Unknown publication "foo"')
        );

        await expect(
            broker.publish('to-topic-foo', { value: 'a' })
        ).rejects.toThrow(new BrokerError('Unknown producer "foo"'));

        expect(() => broker.subscription('foo')).toThrow(
            new BrokerError('Unknown subscription "foo"')
        );
    });

    it('should emit error event', async () => {
        const promise = new Promise((resolve) => {
            broker.on('error', resolve);
        });

        await broker.subscriptionList().runAll();

        await expect(
            broker.publish('to-topic1', [{ value: 'asd' }])
        ).resolves.toMatchObject([{ topicName: topic }]);

        await expect(promise).resolves.toBeInstanceOf(Error);
    });
});
