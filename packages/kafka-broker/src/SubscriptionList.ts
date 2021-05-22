import { Handler, MessageValue, SubscriptionInterface } from './types';

export class SubscriptionList
    extends Array<SubscriptionInterface>
    implements SubscriptionInterface
{
    on<V = MessageValue>(event: string, listener: Handler<V>): this {
        this.forEach((subscription) => subscription.on('message', listener));
        return this;
    }

    once<V = MessageValue>(event: string, listener: Handler<V>): this {
        this.forEach((subscription) => subscription.once('message', listener));
        return this;
    }

    off<V = MessageValue>(event: string, listener: Handler<V>): this {
        this.forEach((subscription) => subscription.off('message', listener));
        return this;
    }

    async run(): Promise<this> {
        await Promise.all(this.map((subscription) => subscription.run()));
        return this;
    }
}
