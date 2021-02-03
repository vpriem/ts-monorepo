import { v4 as uuid } from 'uuid';
import { Broker } from '..';

describe('publish+config', () => {
    const topic = uuid();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': {
                topic,
                messageConfig: { key: 'default-key' },
            },
        },
        subscriptions: {
            'from-topic1': {
                topics: [{ topic, fromBeginning: true }],
            },
        },
    });

    afterAll(() => broker.shutdown());

    it('should publish and consume with config', async () => {
        const values: string[] = [];
        const keys: string[] = [];

        await expect(
            broker.publish('to-topic1', [
                { value: 'foo' },
                { key: 'key-of-bar', value: 'bar' },
            ])
        ).resolves.toMatchObject([{ topicName: topic }]);

        const subscription = broker.subscription('from-topic1');

        const promise = new Promise((resolve) => {
            subscription.on<string>('message', (value, message) => {
                keys.push(message.key.toString());
                values.push(value);
                if (values.length >= 2) resolve(values);
            });
        });

        await subscription.run();

        await expect(promise).resolves.toEqual(
            expect.arrayContaining(['foo', 'bar'])
        );

        expect(keys).toEqual(
            expect.arrayContaining(['default-key', 'key-of-bar'])
        );
    });
});
