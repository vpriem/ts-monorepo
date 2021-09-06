import { Message } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { PublishMessage, MessageValue, SchemaId, SchemaSubject } from './types';
import { encodeMessage } from './encodeMessage';
import { encodeMessagesWithRegistry } from './encodeMessagesWithRegistry';

export const encodeMessages = async <V = MessageValue>(
    messages: PublishMessage<V>[],
    schema?: SchemaId | SchemaSubject,
    schemaRegistry?: SchemaRegistry
): Promise<Message[]> => {
    if (schema) {
        return encodeMessagesWithRegistry(messages, schema, schemaRegistry);
    }

    return messages.map(encodeMessage);
};
