import { Kafka } from 'kafkajs';
import EventEmitter from 'events';
import {
    BrokerConfig,
    PublishMessage,
    PublishMessageValue,
    PublishResult,
} from './types';
import { Subscription } from './Subscription';
import { Config, buildConfig } from './buildConfig';
import { BrokerInterface } from './BrokerInterface';
import { ProducerContainer } from './ProducerContainer';
import { SubscriptionContainer } from './SubscriptionContainer';
import { SubscriptionList } from './SubscriptionList';
import { Publisher } from './Publisher';

export class Broker extends EventEmitter implements BrokerInterface {
    private readonly config: Config;

    private readonly kafka: Kafka;

    private readonly producers: ProducerContainer;

    private readonly publisher: Publisher;

    private readonly subscriptions: SubscriptionContainer;

    constructor(config: BrokerConfig) {
        super({ captureRejections: true });

        this.config = buildConfig(config);

        this.kafka = new Kafka(this.config.config);
        this.producers = new ProducerContainer(
            this.kafka,
            this.config.producers
        );
        this.publisher = new Publisher(
            this.producers,
            this.config.publications
        );
        this.subscriptions = new SubscriptionContainer(
            this.kafka,
            this.publisher,
            this.config.subscriptions
        ).on('error', (error) => this.emit('error', error));
    }

    namespace(): string {
        return this.config.namespace;
    }

    async publish<V = PublishMessageValue>(
        publicationName: string,
        messageOrMessages: PublishMessage<V> | PublishMessage<V>[]
    ): Promise<PublishResult[]> {
        return this.publisher.publish(publicationName, messageOrMessages);
    }

    subscription(name: string): Subscription {
        return this.subscriptions.create(name);
    }

    subscriptionList(): SubscriptionList {
        const subscriptions = Object.keys(this.config.subscriptions);

        return new SubscriptionList(
            ...subscriptions.map((name) => this.subscription(name))
        );
    }

    async shutdown(): Promise<void> {
        await Promise.all([
            this.producers.disconnect(),
            this.subscriptions.disconnect(),
        ]);
    }
}
