import { v4 as uuid } from 'uuid';
import { Broker } from '..';

describe('publish+config', () => {
    const key1 = uuid();
    const key2 = uuid();
    const topic = uuid();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': {
                topic,
                messageConfig: { key: key1 },
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
        const value1 = uuid();
        const value2 = uuid();
        const values: string[] = [];
        const keys: string[] = [];

        await expect(
            broker.publish('to-topic1', [
                { value: value1 },
                { key: key2, value: value2 },
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
            expect.arrayContaining([value1, value2])
        );

        expect(keys).toEqual(expect.arrayContaining([key1, key2]));
    });
});
