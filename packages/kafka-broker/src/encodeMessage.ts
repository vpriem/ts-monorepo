import { Message } from 'kafkajs';
import { PublishMessage, PublishMessageValue } from './types';

export const encodeMessage = <V = PublishMessageValue>(
    message: PublishMessage<V>
): Message => {
    if (message.value === null) {
        return (message as unknown) as Message;
    }

    if (typeof message.value === 'object') {
        if (Buffer.isBuffer(message.value)) {
            return ({
                ...message,
                headers: {
                    ...message.headers,
                    'content-type': 'application/octet-stream',
                },
            } as unknown) as Message;
        }

        return {
            ...message,
            value: JSON.stringify(message.value),
            headers: {
                ...message.headers,
                'content-type': 'application/json',
            },
        };
    }

    return ({
        ...message,
        headers: {
            ...message.headers,
            'content-type': 'text/plain',
        },
    } as unknown) as Message;
};
