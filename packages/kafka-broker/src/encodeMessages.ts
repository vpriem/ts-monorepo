import { Message } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { PublishMessage, MessageValue } from './types';
import { encodeMessage } from './encodeMessage';
import { BrokerError } from './BrokerError';

export const encodeMessages = async <V = MessageValue>(
    messages: PublishMessage<V>[],
    schemaId?: number,
    registry?: SchemaRegistry
): Promise<Message[]> => {
    if (schemaId) {
        // istanbul ignore if
        if (typeof registry === 'undefined') {
            throw new BrokerError('Registry not defined');
        }

        return Promise.all(
            messages.map(async (message) => {
                const value = await registry.encode(schemaId, message.value);
                return {
                    ...message,
                    value,
                    headers: {
                        ...message.headers,
                        'content-type': 'application/sr+avro',
                    },
                };
            })
        );
    }

    return messages.map(encodeMessage);
};
