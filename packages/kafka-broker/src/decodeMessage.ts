import { KafkaMessage } from 'kafkajs';
import { ConsumeMessage } from './types';

export const decodeMessage = (message: KafkaMessage): ConsumeMessage => {
    if (!message.value) return message;

    const contentType = message.headers?.['content-type']?.toString();

    if (contentType === 'application/json') {
        return {
            ...message,
            value: JSON.parse(message.value.toString()) as object,
        };
    }

    return {
        ...message,
        value: message.value.toString(),
    };
};
