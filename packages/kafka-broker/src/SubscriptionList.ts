import { Subscription } from './Subscription';
import { AsyncHandler, Handler } from './types';

export class SubscriptionList extends Array<Subscription> {
    on(event: 'message', handler: Handler | AsyncHandler): this {
        this.forEach((subscription) => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            subscription.on('message', handler);
        });

        return this;
    }

    async runAll(): Promise<this> {
        await Promise.all(this.map((subscription) => subscription.run()));
        return this;
    }
}
