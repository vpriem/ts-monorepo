import EventEmitter from 'events';
import {
    BrokerConfig,
    BrokerContainerConfig,
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
import { KafkaContainer } from './KafkaContainer';
import { buildContainerConfig } from './buildContainerConfig';

const isConfig = (
    config: BrokerConfig | BrokerContainerConfig
): config is BrokerConfig => (config as BrokerConfig).config !== undefined;

export class Broker extends EventEmitter implements BrokerInterface {
    private readonly config: Config;

    private readonly producers: ProducerContainer;

    private readonly subscriptions: SubscriptionContainer;

    constructor(config: BrokerConfig | BrokerContainerConfig) {
        super({ captureRejections: true });

        this.config = isConfig(config)
            ? buildConfig(config)
            : buildContainerConfig(config);

        const kafka = new KafkaContainer(this.config.kafka);

        this.producers = new ProducerContainer(kafka, this.config.producers);

        this.subscriptions = new SubscriptionContainer(
            kafka,
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
        const names = Object.keys(this.config.subscriptions);

        return new SubscriptionList(
            ...names.map((name) => this.subscription(name))
        );
    }

    async shutdown(): Promise<void> {
        await Promise.all([
            this.producers.disconnect(),
            this.subscriptions.disconnect(),
        ]);
    }
}
