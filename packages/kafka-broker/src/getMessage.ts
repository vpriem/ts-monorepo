import {
    ConsumeMessage,
    ConsumeMessageValue,
    Handler,
    SubscriptionInterface,
} from './types';

type Args = [ConsumeMessageValue, ConsumeMessage, string, number];

export function getMessage(
    subscription: SubscriptionInterface,
    n = 1
): Promise<Args | Args[]> {
    if (n === 1) {
        return new Promise((resolve) => {
            subscription.once('message', (...args) => {
                resolve(args);
                return Promise.resolve();
            });
        });
    }

    return new Promise((resolve) => {
        const values: Args[] = [];

        const handler: Handler = (...args) => {
            values.push(args);
            if (values.length >= n) {
                resolve(values);
                subscription.off('message', handler);
            }

            return Promise.resolve();
        };

        subscription.on('message', handler);
    });
}
