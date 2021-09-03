import { v4 as uuid } from 'uuid';
import { readAVSCAsync } from '@kafkajs/confluent-schema-registry';
import path from 'path';
import fs from 'fs';
import {
    Broker,
    SchemaRegistry,
    SchemaType,
    COMPATIBILITY,
    getMessage,
} from '..';

interface AvroEvent {
    id: string;
    avro: boolean;
}

interface JsonEvent {
    id: string;
    json: boolean;
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
            'to-topic-avro': {
                topic,
                schemaId: 1,
            },
            'to-topic-json': {
                topic,
                schemaId: 2,
            },
        },
        subscriptions: {
            'from-topic': topic,
        },
    });

    beforeAll(async () => {
        const schemaAVRO = await readAVSCAsync(
            path.join(__dirname, 'event.avsc')
        );

        const schemaJSON = fs.readFileSync(
            path.join(__dirname, 'event.json'),
            'utf8'
        );

        const registry: SchemaRegistry = broker.schemaRegistry()!;

        expect(registry).toBeDefined();

        await expect(
            registry.register({
                type: SchemaType.AVRO,
                schema: JSON.stringify(schemaAVRO),
            })
        ).resolves.toEqual({ id: 1 });

        await expect(
            registry.register(
                {
                    type: SchemaType.JSON,
                    schema: schemaJSON,
                },
                {
                    subject: 'test.Json',
                    compatibility: COMPATIBILITY.NONE,
                }
            )
        ).resolves.toEqual({ id: 2 });
    });

    afterAll(() => broker.shutdown());

    it('should publish and consume AVRO message', async () => {
        const id = uuid();
        const subscription = broker.subscription('from-topic');

        const message = getMessage(subscription);

        await subscription.run();

        await expect(
            broker.publish<AvroEvent>('to-topic-avro', {
                value: { id, avro: true },
            })
        ).resolves.toMatchObject([{ topicName: topic }]);

        await expect(message).resolves.toEqual([
            { id, avro: true },
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

    it('should publish and consume JSON message', async () => {
        const id = uuid();
        const subscription = broker.subscription('from-topic');

        const message = getMessage(subscription);

        await subscription.run();

        await expect(
            broker.publish<JsonEvent>('to-topic-json', {
                value: { id, json: true },
            })
        ).resolves.toMatchObject([{ topicName: topic }]);

        await expect(message).resolves.toEqual([
            { id, json: true },
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
