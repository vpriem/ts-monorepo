import { Subscription } from './Subscription';
import { ConsumeMessage, ConsumeMessageValue, Handler } from './types';

type Args = [ConsumeMessageValue, ConsumeMessage, string, number];

export function getMessage(subscription: Subscription): Promise<Args>;

export function getMessage(
    subscription: Subscription,
    n: number
): Promise<Args[]>;

export function getMessage(
    subscription: Subscription,
    n = 1
): Promise<Args | Args[]> {
    if (n === 1) {
        return new Promise((resolve) => {
            subscription.once('message', (...args) => resolve(args));
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
        };

        subscription.on('message', handler);
    });
}
