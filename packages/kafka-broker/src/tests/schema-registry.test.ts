import { v4 as uuid } from 'uuid';
import {
    readAVSCAsync,
    SchemaRegistry,
} from '@kafkajs/confluent-schema-registry';
import { SchemaType } from '@kafkajs/confluent-schema-registry/dist/@types';
import path from 'path';
import { Broker, getMessage } from '..';

interface Event {
    id: string;
    name: string;
}

describe('schema registry', () => {
    const topic = uuid();
    const broker = new Broker({
        namespace: uuid(),
        config: {
            brokers: [process.env.KAFKA_BROKER as string],
        },
        schemaRegistry: {
            host: process.env.SCHEMA_REGISTRY_HOST as string,
        },
        publications: {
            'to-topic1': {
                topic,
                schemaId: 1,
            },
        },
        subscriptions: {
            'from-topic1': topic,
        },
    });

    beforeAll(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const schema = await readAVSCAsync(path.join(__dirname, 'event.avsc'));

        const schemaRegistry = new SchemaRegistry({
            host: process.env.SCHEMA_REGISTRY_HOST as string,
        });

        await expect(
            schemaRegistry.register({
                type: SchemaType.AVRO,
                schema: JSON.stringify(schema),
            })
        ).resolves.toEqual({ id: 1 });
    });

    afterAll(() => broker.shutdown());

    it('should publish and consume', async () => {
        const id = uuid();
        const name = uuid();
        const subscription = broker.subscription('from-topic1');

        const message = getMessage(subscription);

        await subscription.run();

        await expect(
            broker.publish<Event>('to-topic1', { value: { id, name } })
        ).resolves.toMatchObject([{ topicName: topic }]);

        await expect(message).resolves.toEqual([
            { id, name },
            expect.objectContaining({
                message: expect.objectContaining({
                    headers: {
                        'content-type': Buffer.from(
                            'application/schema-registry'
                        ),
                    },
                }) as object,
                topic,
            }),
            expect.any(Function),
        ]);
    });
});
