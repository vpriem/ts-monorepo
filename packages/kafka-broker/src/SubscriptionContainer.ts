import EventEmitter from 'events';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Subscription } from './Subscription';
import { BrokerError } from './BrokerError';
import { Config } from './buildConfig';
import { PublisherInterface } from './types';
import { KafkaContainer } from './KafkaContainer';

export class SubscriptionContainer extends EventEmitter {
    private readonly kafka: KafkaContainer;

    private readonly publisher: PublisherInterface;

    private readonly config: Config['subscriptions'];

    private readonly registry?: SchemaRegistry;

    private subscriptions: Record<string, Subscription> = {};

    constructor(
        kafka: KafkaContainer,
        publisher: PublisherInterface,
        config: Config['subscriptions'],
        registry?: SchemaRegistry
    ) {
        super({ captureRejections: true });

        this.kafka = kafka;
        this.publisher = publisher;
        this.config = config;
        this.registry = registry;
    }

    create(name: string): Subscription {
        if (typeof this.subscriptions[name] === 'undefined') {
            const subscriptionConfig = this.config[name];
            if (typeof subscriptionConfig === 'undefined') {
                throw new BrokerError(`Unknown subscription "${name}"`);
            }

            const { kafka: kafkaName, consumer: consumerConfig } =
                subscriptionConfig;

            this.subscriptions[name] = new Subscription(
                this.kafka.consumer(kafkaName, consumerConfig),
                this.publisher,
                subscriptionConfig,
                this.registry
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
