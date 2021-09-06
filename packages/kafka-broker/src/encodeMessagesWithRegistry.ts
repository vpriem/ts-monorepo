import { Message } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import {
    PublishMessage,
    MessageValue,
    ContentTypes,
    SchemaId,
    SchemaSubject,
} from './types';
import { BrokerError } from './BrokerError';

const subjectToId: Record<string, number> = {};
// TODO: build cache with TTL or fix @kafkajs/confluent-schema-registry
const getSchemaIdFromSubject = async (
    schemaRegistry: SchemaRegistry,
    { subject, version }: SchemaSubject
): Promise<number> => {
    const hash = `${subject}:${version}`;

    if (!subjectToId[hash]) {
        subjectToId[hash] = await (version === 'latest'
            ? schemaRegistry.getLatestSchemaId(subject)
            : schemaRegistry.getRegistryId(subject, version));
    }

    return subjectToId[hash];
};

const isSchemaSubject = (
    schema: SchemaId | SchemaSubject
): schema is SchemaSubject =>
    typeof (schema as SchemaSubject).subject !== 'undefined';

export const encodeMessagesWithRegistry = async <V = MessageValue>(
    messages: PublishMessage<V>[],
    schema: SchemaId | SchemaSubject,
    schemaRegistry?: SchemaRegistry
): Promise<Message[]> => {
    // istanbul ignore if
    if (typeof schemaRegistry === 'undefined') {
        throw new BrokerError('Registry not defined');
    }

    let schemaId: number;

    if (isSchemaSubject(schema)) {
        schemaId = await getSchemaIdFromSubject(schemaRegistry, schema);
    } else {
        schemaId = schema.id;
    }

    return Promise.all(
        messages.map(async (message) => {
            const value = await schemaRegistry.encode(schemaId, message.value);
            return {
                ...message,
                value,
                headers: {
                    ...message.headers,
                    'content-type': ContentTypes.SCHEMA_REGISTRY,
                },
            };
        })
    );
};
