import { v4 as uuid } from 'uuid';
import { Broker, BrokerContainer, BrokerError, getMessage } from '..';

describe('broker+container', () => {
    const namespace = uuid();
    const topic1 = uuid();
    const topic2 = uuid();
    const broker = new BrokerContainer({
        namespace,
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

    it('should throw on unknown publication broker', () =>
        expect(broker.publish('foo/bar', { value: uuid() })).rejects.toThrow(
            new BrokerError('Unknown broker "foo"')
        ));

    it('should throw on unknown subscription broker ', () =>
        expect(() => broker.subscription('foo/bar')).toThrow(
            new BrokerError('Unknown broker "foo"')
        ));

    it('should return namespace', () => {
        expect(broker.namespace()).toBe(namespace);
        expect(broker.get('public').namespace()).toBe(`${namespace}.public`);
        expect(broker.get('private').namespace()).toBe(`${namespace}.private`);
    });

    it('should return brokers', () => {
        expect(broker.get('public')).toBeInstanceOf(Broker);
        expect(broker.get('private')).toBeInstanceOf(Broker);
    });

    it('should return subscriptions', () => {
        expect(broker.get('public').subscriptionList()).toHaveLength(1);
        expect(broker.get('private').subscriptionList()).toHaveLength(1);
        expect(broker.subscriptionList()).toHaveLength(2);
    });

    it('should publish and consume from all brokers', async () => {
        const value1 = uuid();
        const value2 = uuid();

        const subscriptions = broker.subscriptionList();
        expect(subscriptions).toHaveLength(2);
        const message = getMessage(subscriptions, 2);

        await subscriptions.run();

        await expect(
            broker.publish('public/to-topic1', { value: value1 })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(
            broker.publish('private/to-topic2', { value: value2 })
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(message).resolves.toEqual(
            expect.arrayContaining([
                [value1, expect.any(Object), topic1, expect.any(Number)],
                [value2, expect.any(Object), topic2, expect.any(Number)],
            ])
        );
    });

    it('should emit error event', async () => {
        broker.on('error', () => undefined);
        const error = new Promise((resolve) => {
            broker.on('error', resolve);
        });

        await broker
            .subscriptionList()
            .on('message', () => Promise.reject(new Error('Sorry')))
            .run();

        await expect(
            broker.publish('private/to-topic2', [{ value: uuid() }])
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(error).resolves.toThrow('Sorry');
    });
});
