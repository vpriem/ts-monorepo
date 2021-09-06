import EventEmitter from 'events';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import {
    BrokerConfig,
    BrokerContainerConfig,
    BrokerInterface,
    PublishMessage,
    MessageValue,
    PublishResult,
    SubscriptionInterface,
} from './types';
import { Config, buildConfig } from './buildConfig';
import { ProducerContainer } from './ProducerContainer';
import { SubscriptionContainer } from './SubscriptionContainer';
import { SubscriptionList } from './SubscriptionList';
import { BrokerError } from './BrokerError';
import { encodeMessages } from './encodeMessages';
import { KafkaContainer } from './KafkaContainer';
import { buildContainerConfig } from './buildContainerConfig';

const isConfig = (
    config: BrokerConfig | BrokerContainerConfig
): config is BrokerConfig => (config as BrokerConfig).config !== undefined;

export class Broker extends EventEmitter implements BrokerInterface {
    private readonly config: Config;

    private readonly registry?: SchemaRegistry;

    private readonly producers: ProducerContainer;

    private readonly subscriptions: SubscriptionContainer;

    constructor(config: BrokerConfig | BrokerContainerConfig) {
        super({ captureRejections: true });

        this.config = isConfig(config)
            ? buildConfig(config)
            : buildContainerConfig(config);

        const kafka = new KafkaContainer(this.config.kafka);

        if (this.config.schemaRegistry) {
            this.registry = new SchemaRegistry(
                this.config.schemaRegistry,
                this.config.schemaRegistry.options
            );
        }

        this.producers = new ProducerContainer(kafka, this.config.producers);

        this.subscriptions = new SubscriptionContainer(
            kafka,
            this,
            this.config.subscriptions,
            this.registry
        ).on('error', (error) => this.emit('error', error));
    }

    namespace(): string {
        return this.config.namespace;
    }

    schemaRegistry(): SchemaRegistry | undefined {
        return this.registry;
    }

    async publish<V = MessageValue>(
        publicationName: string,
        messageOrMessages: PublishMessage<V> | PublishMessage<V>[]
    ): Promise<PublishResult[]> {
        const publicationConfig = this.config.publications[publicationName];
        if (typeof publicationConfig === 'undefined') {
            throw new BrokerError(`Unknown publication "${publicationName}"`);
        }

        const {
            config,
            producer: producerName,
            topic,
            messageConfig,
            schema,
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

        const encodedMessages = await encodeMessages(
            messages,
            schema,
            this.registry
        );

        return producer.send({
            ...config,
            topic,
            messages: encodedMessages,
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
