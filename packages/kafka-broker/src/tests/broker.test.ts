import { v4 as uuid } from 'uuid';
import { Broker, BrokerError } from '..';

describe('broker', () => {
    const namespace = uuid();
    const topic = uuid();
    const broker = new Broker({
        namespace,
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic-foo': {
                topic,
                producer: 'foo',
            },
        },
        subscriptions: {
            'from-topic-foo': topic,
        },
    });

    afterAll(() => broker.shutdown());

    it('should return namespace', () =>
        expect(broker.namespace()).toBe(namespace));

    it('should throw on unknown publication', () =>
        expect(broker.publish('foo', { value: uuid() })).rejects.toThrow(
            new BrokerError('Unknown publication "foo"')
        ));

    it('should throw on unknown producer', () =>
        expect(
            broker.publish('to-topic-foo', { value: uuid() })
        ).rejects.toThrow(new BrokerError('Unknown producer "foo"')));

    it('should throw on unknown subscription', () =>
        expect(() => broker.subscription('foo')).toThrow(
            new BrokerError('Unknown subscription "foo"')
        ));

    it('should throw on unknown topic', () =>
        expect(() =>
            broker
                .subscription('from-topic-foo')
                .on('message.foo', () => Promise.resolve())
        ).toThrow(new BrokerError('Unknown topic or alias "foo"')));

    it('should throw on unknown topic', () =>
        expect(() =>
            broker
                .subscription('from-topic-foo')
                .off('message.foo', () => Promise.resolve())
        ).toThrow(new BrokerError('Unknown topic or alias "foo"')));
});
