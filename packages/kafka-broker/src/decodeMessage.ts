import { KafkaMessage } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { ContentTypes, MessageValue } from './types';
import { BrokerError } from './BrokerError';

export const decodeMessage = async (
    message: KafkaMessage,
    registry?: SchemaRegistry,
    contentTypeOverride?: ContentTypes | string
): Promise<MessageValue> => {
    if (!message.value) return message.value;

    const contentType =
        contentTypeOverride || message.headers?.['content-type']?.toString();

    if (contentType === ContentTypes.JSON) {
        return JSON.parse(message.value.toString()) as object;
    }

    if (contentType === ContentTypes.SCHEMA_REGISTRY) {
        if (typeof registry === 'undefined') {
            throw new BrokerError('Registry not found');
        }

        return (await registry.decode(message.value)) as MessageValue;
    }

    if (contentType === ContentTypes.TEXT) {
        return message.value.toString();
    }

    return message.value;
};
