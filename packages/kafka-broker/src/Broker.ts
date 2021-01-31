import { Kafka, RecordMetadata } from 'kafkajs';
import { BrokerConfig, PublishMessage, PublishMessageValue } from './types';
import { Subscription } from './Subscription';
import { Config, buildConfig } from './buildConfig';
import { encodeMessage } from './encodeMessage';
import { BrokerInterface } from './BrokerInterface';
import { BrokerError } from './BrokerError';
import { ProducerContainer } from './ProducerContainer';
import { SubscriptionContainer } from './SubscriptionContainer';
import { SubscriptionList } from './SubscriptionList';

export class Broker implements BrokerInterface {
    private readonly config: Config;

    private readonly kafka: Kafka;

    private readonly producers: ProducerContainer;

    private readonly subscriptions: SubscriptionContainer;

    constructor(config: BrokerConfig) {
        this.config = buildConfig(config);

        this.kafka = new Kafka(this.config.config);
        this.producers = new ProducerContainer(
            this.kafka,
            this.config.producers
        );
        this.subscriptions = new SubscriptionContainer(
            this.kafka,
            this.config.subscriptions
        );
    }

    async publish<V = PublishMessageValue>(
        publicationName: string,
        messageOrMessages: PublishMessage<V> | PublishMessage<V>[]
    ): Promise<RecordMetadata[]> {
        const publicationConfig = this.config.publications[publicationName];
        if (typeof publicationConfig === 'undefined') {
            throw new BrokerError(`Unknown publication "${publicationName}"`);
        }

        const {
            producer: producerName,
            topic,
            messageConfig,
        } = publicationConfig;

        const producer = await this.producers.create(producerName);

        let messages = Array.isArray(messageOrMessages)
            ? messageOrMessages
            : [messageOrMessages];

        if (messageConfig) {
            messages = messages.map((message) => ({
                ...messageConfig,
                ...message,
            }));
        }

        return producer.send({
            ...publicationConfig.config,
            topic,
            messages: messages.map(encodeMessage),
        });
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
