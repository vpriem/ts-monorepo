import { Message } from 'kafkajs';
import { PublishMessage, MessageValue, ContentTypes } from './types';

export const encodeMessage = <V = MessageValue>(
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
                    'content-type': ContentTypes.BUFFER,
                },
            } as unknown) as Message;
        }

        return {
            ...message,
            value: JSON.stringify(message.value),
            headers: {
                ...message.headers,
                'content-type': ContentTypes.JSON,
            },
        };
    }

    return ({
        ...message,
        headers: {
            ...message.headers,
            'content-type': ContentTypes.TEXT,
        },
    } as unknown) as Message;
};
