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

    const contentType =
        contentTypeOverride || message.headers?.['content-type']?.toString();

    if (contentType === 'application/json') {
        return JSON.parse(message.value.toString()) as object;
    }

    if (contentType === 'application/sr+avro') {
        // istanbul ignore if
        if (typeof registry === 'undefined') {
            throw new BrokerError('Registry not defined');
        }

        return (await registry.decode(message.value)) as ConsumeValue;
    }

    if (contentType === 'text/plain') {
        return message.value.toString();
    }

    return message.value;
};
