import { Kafka } from 'kafkajs';
import EventEmitter from 'events';
import {
    BrokerConfig,
    BrokerInterface,
    PublishMessage,
    PublishMessageValue,
    PublishResult,
    SubscriptionInterface,
} from './types';
import { Config, buildConfig } from './buildConfig';
import { ProducerContainer } from './ProducerContainer';
import { SubscriptionContainer } from './SubscriptionContainer';
import { SubscriptionList } from './SubscriptionList';
import { BrokerError } from './BrokerError';
import { encodeMessage } from './encodeMessage';

export class Broker extends EventEmitter implements BrokerInterface {
    private readonly config: Config;

    private readonly kafka: Kafka;

    private readonly producers: ProducerContainer;

    private readonly subscriptions: SubscriptionContainer;

    constructor(config: BrokerConfig) {
        super({ captureRejections: true });

        this.config = buildConfig(config);

        this.kafka = new Kafka(this.config.config);
        this.producers = new ProducerContainer(
            this.kafka,
            this.config.producers
        );
        this.subscriptions = new SubscriptionContainer(
            this.kafka,
            this,
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

    subscription(name: string): SubscriptionInterface {
        return this.subscriptions.create(name);
    }

    subscriptionList(): SubscriptionInterface {
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
