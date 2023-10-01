import { Handler, MessageValue, SubscriptionInterface } from './types';

export class SubscriptionList
    extends Array<SubscriptionInterface>
    implements SubscriptionInterface
{
    on<V = MessageValue>(
        event: 'message' | `message.${string}` | 'error',
        listener: Handler<V> | ((error: Error) => void)
    ): this {
        this.forEach((subscription) =>
            subscription.on(event as 'message', listener as Handler<V>)
        );
        return this;
    }

    once(event: 'error', listener: (error: Error) => void): this {
        this.forEach((subscription) => subscription.once(event, listener));
        return this;
    }

    off<V = MessageValue>(
        event: 'message' | `message.${string}` | 'error',
        listener: Handler<V> | ((error: Error) => void)
    ): this {
        this.forEach((subscription) =>
            subscription.off(event as 'message', listener as Handler<V>)
        );
        return this;
    }

    async run(): Promise<this> {
        await Promise.all(this.map((subscription) => subscription.run()));
        return this;
    }
}
