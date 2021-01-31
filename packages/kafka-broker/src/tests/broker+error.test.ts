import { v4 as uuid } from 'uuid';
import { Broker, BrokerError } from '..';

describe('broker+error', () => {
    const topic = uuid();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': {
                topic,
                producer: 'foo',
            },
        },
    });

    afterAll(() => broker.shutdown());

    it('should throw BrokerError', async () => {
        await expect(broker.publish('foo', { value: 'a' })).rejects.toThrow(
            new BrokerError('Unknown publication "foo"')
        );

        await expect(
            broker.publish('to-topic1', { value: 'a' })
        ).rejects.toThrow(new BrokerError('Unknown producer "foo"'));

        expect(() => broker.subscription('foo')).toThrow(
            new BrokerError('Unknown subscription "foo"')
        );
    });
});
