import { Message } from 'kafkajs';
import { PublishMessage, PublishMessageValue } from './types';

export const encodeMessage = <V = PublishMessageValue>(
    message: PublishMessage<V>
): Message =>
    (typeof message.value === 'object' && message.value !== null
        ? {
              ...message,
              value: JSON.stringify(message.value),
              headers: {
                  ...message.headers,
                  'content-type': 'application/json',
              },
          }
        : message) as Message;
