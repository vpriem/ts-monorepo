import { Message } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { PublishMessage, PublishMessageValue } from './types';
import { encodeMessage } from './encodeMessage';
import { BrokerError } from './BrokerError';

export const encodeMessages = async <V = PublishMessageValue>(
    messages: PublishMessage<V>[],
    schemaId?: number,
    registry?: SchemaRegistry
): Promise<Message[]> => {
    if (schemaId) {
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
                        'content-type': 'application/avro',
                    },
                };
            })
        );
    }

    return messages.map(encodeMessage);
};
