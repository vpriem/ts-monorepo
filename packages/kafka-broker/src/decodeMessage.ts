import { KafkaMessage } from 'kafkajs';
import { ConsumeMessageValue } from './types';

export const decodeMessage = (message: KafkaMessage): ConsumeMessageValue => {
    if (!message.value) return message.value;

    const value = message.value.toString();

    const contentType = message.headers?.['content-type']?.toString();
    if (contentType === 'application/json') {
        return JSON.parse(value) as object;
    }

    return value;
};
