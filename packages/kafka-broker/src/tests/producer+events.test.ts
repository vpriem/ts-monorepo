import { v4 as uuid } from 'uuid';
import { Broker } from '..';

describe('producer+events', () => {
    const topic1 = uuid();
    const onConnect = jest.fn();
    const onDisconnect = jest.fn();
    const onRequest = jest.fn();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        publications: {
            'to-topic1': topic1,
        },
    })
        .on('producer.connect', onConnect)
        .on('producer.disconnect', onDisconnect)
        .on('producer.network.request', onRequest);

    afterAll(() => broker.shutdown());

    it('should emit events', async () => {
        expect(onConnect).not.toHaveBeenCalled();
        expect(onDisconnect).not.toHaveBeenCalled();
        expect(onRequest).not.toHaveBeenCalled();

        await expect(
            broker.publish<string>('to-topic1', { value: uuid() })
        ).resolves.toMatchObject([{ topicName: topic1 }]);

        expect(onConnect).toHaveBeenCalledTimes(1);
        expect(onDisconnect).not.toHaveBeenCalled();
        expect(onRequest).toHaveBeenCalled();

        await broker.shutdown();

        expect(onDisconnect).toHaveBeenCalledTimes(1);
    });
});
