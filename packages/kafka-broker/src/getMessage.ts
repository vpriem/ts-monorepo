import {
    MessageValue,
    ConsumePayload,
    Publish,
    SubscriptionInterface,
    Handler,
} from './types';

type Args = [MessageValue, ConsumePayload, Publish];

export function getMessage(
    subscription: SubscriptionInterface,
    n = 1
): Promise<Args | Args[]> {
    if (n === 1) {
        return new Promise((resolve, reject) => {
            const handler: Handler = (...args) => {
                resolve(args);
                subscription.off('message', handler);
                return Promise.resolve();
            };

            subscription.on('message', handler).once('error', reject);
        });
    }

    return new Promise((resolve, reject) => {
        const values: Args[] = [];

        const handler: Handler = (...args) => {
            values.push(args);
            if (values.length >= n) {
                resolve(values);
                subscription.off('message', handler);
            }

            return Promise.resolve();
        };

        subscription.on('message', handler).on('error', reject);
    });
}
