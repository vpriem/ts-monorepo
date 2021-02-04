import { v4 as uuid } from 'uuid';
import { Broker, BrokerContainer, BrokerError } from '..';

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
        await expect(
            broker.publish('foo/bar', { value: uuid() })
        ).rejects.toThrow(new BrokerError('Unknown broker "foo"'));

        expect(() => broker.subscription('foo/bar')).toThrow(
            new BrokerError('Unknown broker "foo"')
        );
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
        const values: string[] = [];

        const subscriptions = broker.subscriptionList();

        const promise = new Promise((resolve) => {
            subscriptions.on<string>('message', (value) => {
                values.push(value);
                if (values.length >= 2) resolve(values);
            });
        });

        await subscriptions.runAll();

        await expect(
            broker.publish('public/to-topic1', { value: value1 })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(
            broker.publish('private/to-topic2', { value: value2 })
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(promise).resolves.toEqual(
            expect.arrayContaining([value1, value2])
        );
    });

    it('should emit error event', async () => {
        broker.on('error', () => undefined);
        const promise = new Promise((resolve) => {
            broker.on('error', resolve);
        });

        await broker
            .subscriptionList()
            .on('message', () => Promise.reject(new Error('Sorry')))
            .runAll();

        await expect(
            broker.publish('private/to-topic2', [{ value: uuid() }])
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(promise).resolves.toThrow('Sorry');
    });
});
