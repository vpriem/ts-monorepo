import { KafkaMessage } from 'kafkajs';
import { ConsumeValue } from './types';

export const decodeMessage = (
    message: KafkaMessage,
    contentTypeOverride?: 'application/json'
): ConsumeValue => {
    if (!message.value) return message.value;

    const value = message.value.toString();

    const contentType =
        contentTypeOverride || message.headers?.['content-type']?.toString();
    if (contentType === 'application/json') {
        return JSON.parse(value) as object;
    }

    return value;
};
