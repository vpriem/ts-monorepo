import { v4 as uuid } from 'uuid';
import { Broker } from '..';

interface Event {
    id: number;
}

describe('subscribe+run+once', () => {
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

    it('should subscribe and run once', async () => {
        broker.subscription('from-topic1');
        const subscription = broker.subscription('from-topic1');

        const promise = new Promise((resolve) => {
            subscription.on<Event>('message', (value) => {
                resolve(value.id);
            });
        });

        await subscription.run();
        await subscription.run();

        await expect(
            broker.publish<Event>('to-topic1', { value: { id: 999 } })
        ).resolves.toMatchObject([{ topicName: topic }]);

        await expect(promise).resolves.toBe(999);
    });
});
