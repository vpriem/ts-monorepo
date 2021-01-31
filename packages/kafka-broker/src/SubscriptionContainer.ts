import { Kafka } from 'kafkajs';
import { Subscription } from './Subscription';
import { BrokerError } from './BrokerError';
import { Config } from './buildConfig';

export class SubscriptionContainer {
    private readonly kafka: Kafka;

    private readonly config: Config['subscriptions'];

    private subscriptions: Record<string, Subscription> = {};

    constructor(kafka: Kafka, config: Config['subscriptions']) {
        this.kafka = kafka;
        this.config = config;
    }

    create(name: string): Subscription {
        if (typeof this.subscriptions[name] === 'undefined') {
            const subscriptionConfig = this.config[name];
            if (typeof subscriptionConfig === 'undefined') {
                throw new BrokerError(`Unknown subscription "${name}"`);
            }

            this.subscriptions[name] = new Subscription(
                this.kafka.consumer(subscriptionConfig.consumer),
                name,
                subscriptionConfig
            );
        }

        return this.subscriptions[name];
    }

    async disconnect(): Promise<void> {
        const { subscriptions } = this;

        this.subscriptions = {};

        await Promise.all(
            Object.values(subscriptions).map((subscription) =>
                subscription.disconnect()
            )
        );
    }
}
