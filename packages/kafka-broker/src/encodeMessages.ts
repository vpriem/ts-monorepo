import { Message } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { PublishMessage, MessageValue, ContentTypes } from './types';
import { encodeMessage } from './encodeMessage';
import { BrokerError } from './BrokerError';

export const encodeMessages = async <V = MessageValue>(
    messages: PublishMessage<V>[],
    schemaId?: number,
    schemaRegistry?: SchemaRegistry
): Promise<Message[]> => {
    if (schemaId) {
        // istanbul ignore if
        if (typeof schemaRegistry === 'undefined') {
            throw new BrokerError('Registry not defined');
        }

        return Promise.all(
            messages.map(async (message) => {
                const value = await schemaRegistry.encode(
                    schemaId,
                    message.value
                );
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
    }

    return messages.map(encodeMessage);
};
