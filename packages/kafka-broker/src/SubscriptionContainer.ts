import { Kafka } from 'kafkajs';
import EventEmitter from 'events';
import { Subscription } from './Subscription';
import { BrokerError } from './BrokerError';
import { Config } from './buildConfig';
import { PublisherInterface } from './types';

export class SubscriptionContainer extends EventEmitter {
    private readonly kafka: Kafka;

    private readonly publisher: PublisherInterface;

    private readonly config: Config['subscriptions'];

    private subscriptions: Record<string, Subscription> = {};

    constructor(
        kafka: Kafka,
        publisher: PublisherInterface,
        config: Config['subscriptions']
    ) {
        super({ captureRejections: true });

        this.kafka = kafka;
        this.publisher = publisher;
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
                this.publisher,
                subscriptionConfig
            ).on('error', (error) => {
                this.emit('error', error);
            });
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
