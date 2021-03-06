import { v4 as uuid } from 'uuid';
import { Broker, Handler } from '..';

describe('error+handling', () => {
    const topic1 = uuid();
    const topic2 = uuid();
    const handler: Handler = () => Promise.reject(new Error('Sorry'));
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': topic1,
            'to-topic2': topic2,
        },
        subscriptions: {
            'from-topic1': {
                topics: [topic1],
                handler,
            },
            'from-topic2': topic2,
        },
    });

    afterAll(() => broker.shutdown());

    it('should catch handler error', async () => {
        broker.on('error', () => undefined);
        const error = new Promise((resolve) => {
            broker.on('error', resolve);
        });

        await broker.subscription('from-topic1').run();

        await expect(
            broker.publish('to-topic1', [{ value: uuid() }])
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        await expect(error).resolves.toThrow('Sorry');
    });

    it('should catch error', async () => {
        broker.on('error', () => undefined);
        const error = new Promise((resolve) => {
            broker.on('error', resolve);
        });

        await broker
            .subscription('from-topic2')
            .on('message', () => Promise.reject(new Error('Really')))
            .run();

        await expect(
            broker.publish('to-topic2', [{ value: uuid() }])
        ).resolves.toMatchObject([{ topicName: topic2 }]);

        await expect(error).resolves.toThrow('Really');
    });
});
