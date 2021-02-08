import { Subscription } from './Subscription';
import { Handler, ConsumeMessageValue } from './types';

export class SubscriptionList extends Array<Subscription> {
    on<V = ConsumeMessageValue>(event: 'message', handler: Handler<V>): this {
        this.forEach((subscription) => subscription.on('message', handler));
        return this;
    }

    async runAll(): Promise<this> {
        await Promise.all(this.map((subscription) => subscription.run()));
        return this;
    }
}
