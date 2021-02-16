import { KafkaMessage } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { ConsumeValue } from './types';
import { BrokerError } from './BrokerError';

export const decodeMessage = async (
    message: KafkaMessage,
    registry?: SchemaRegistry,
    contentTypeOverride?: 'application/json'
): Promise<ConsumeValue> => {
    if (!message.value) return message.value;

    const value = message.value.toString();

    const contentType =
        contentTypeOverride || message.headers?.['content-type']?.toString();

    if (contentType === 'application/json') {
        return JSON.parse(value) as object;
    }

    if (contentType === 'application/avro') {
        if (typeof registry === 'undefined') {
            throw new BrokerError('Registry not defined');
        }

        return (await registry.decode(message.value)) as ConsumeValue;
    }

    return value;
};
