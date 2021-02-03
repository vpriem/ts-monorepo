import { v4 as uuid } from 'uuid';
import { Broker } from '..';

interface Event {
    id: number;
}

describe('publish+json', () => {
    const topic = uuid();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': topic,
        },
        subscriptions: {
            'from-topic1': topic,
        },
    });

    afterAll(() => broker.shutdown());

    it('should publish and consume', async () => {
        const values: number[] = [];
        const headers: Array<string | undefined> = [];

        const subscription = broker.subscription('from-topic1');

        const promise = new Promise((resolve) => {
            subscription.on<Event>('message', (value, message) => {
                headers.push(message.headers?.['content-type']?.toString());
                values.push(value.id);
                if (values.length >= 4) resolve(values);
            });
        });

        await subscription.run();

        await expect(
            broker.publish<Event>('to-topic1', [
                { value: { id: 1 } },
                { value: { id: 2 } },
                { value: { id: 3 } },
                { value: { id: 4 } },
            ])
        ).resolves.toMatchObject([{ topicName: topic }]);

        await expect(promise).resolves.toEqual(
            expect.arrayContaining([1, 2, 3, 4])
        );

        expect(headers).toEqual([
            'application/json',
            'application/json',
            'application/json',
            'application/json',
        ]);
    });
});
