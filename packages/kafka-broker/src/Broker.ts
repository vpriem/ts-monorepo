import EventEmitter from 'events';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import {
    ConnectEvent,
    ConsumerCommitOffsetsEvent,
    ConsumerCrashEvent,
    ConsumerEndBatchProcessEvent,
    ConsumerFetchEvent,
    ConsumerFetchStartEvent,
    ConsumerGroupJoinEvent,
    ConsumerHeartbeatEvent,
    ConsumerRebalancingEvent,
    ConsumerReceivedUnsubcribedTopicsEvent,
    ConsumerStartBatchProcessEvent,
    DisconnectEvent,
    InstrumentationEvent,
    ProducerBatch,
    RequestEvent,
    RequestQueueSizeEvent,
    RequestTimeoutEvent,
} from 'kafkajs';
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

export declare interface Broker {
    on(event: 'error', listener: (error: Error) => void): this;

    on(
        event: 'producer.connect',
        listener: (event: ConnectEvent) => void
    ): this;
    on(
        event: 'producer.disconnect',
        listener: (event: DisconnectEvent) => void
    ): this;
    on(
        event: 'producer.network.request',
        listener: (event: RequestEvent) => void
    ): this;
    on(
        event: 'producer.network.request_timeout',
        listener: (event: RequestTimeoutEvent) => void
    ): this;
    on(
        event: 'producer.network.request_queue_size',
        listener: (event: RequestQueueSizeEvent) => void
    ): this;
    on(
        event: 'producer.batch.start',
        listener: (event: ProducerBatch) => void
    ): this;

    on(
        event: 'consumer.heartbeat',
        listener: (event: ConsumerHeartbeatEvent) => void
    ): this;
    on(
        event: 'consumer.commit_offsets',
        listener: (event: ConsumerCommitOffsetsEvent) => void
    ): this;
    on(
        event: 'consumer.group_join',
        listener: (event: ConsumerGroupJoinEvent) => void
    ): this;
    on(
        event: 'consumer.fetch_start',
        listener: (event: ConsumerFetchStartEvent) => void
    ): this;
    on(
        event: 'consumer.fetch',
        listener: (event: ConsumerFetchEvent) => void
    ): this;
    on(
        event: 'consumer.start_batch_process',
        listener: (event: ConsumerStartBatchProcessEvent) => void
    ): this;
    on(
        event: 'consumer.end_batch_process',
        listener: (event: ConsumerEndBatchProcessEvent) => void
    ): this;
    on(
        event: 'consumer.connect',
        listener: (event: ConnectEvent) => void
    ): this;
    on(
        event: 'consumer.disconnect',
        listener: (event: DisconnectEvent) => void
    ): this;
    on(
        event: 'consumer.stop',
        listener: (event: InstrumentationEvent<null>) => void
    ): this;
    on(
        event: 'consumer.crash',
        listener: (event: ConsumerCrashEvent) => void
    ): this;
    on(
        event: 'consumer.rebalancing',
        listener: (event: ConsumerRebalancingEvent) => void
    ): this;
    on(
        event: 'consumer.received_unsubscribed_topics',
        listener: (event: ConsumerReceivedUnsubcribedTopicsEvent) => void
    ): this;
    on(
        event: 'consumer.network.request',
        listener: (event: RequestEvent) => void
    ): this;
    on(
        event: 'consumer.network.request_timeout',
        listener: (event: RequestTimeoutEvent) => void
    ): this;
    on(
        event: 'consumer.network.request_queue_size',
        listener: (event: RequestQueueSizeEvent) => void
    ): this;
}

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

        [
            'producer.connect',
            'producer.disconnect',
            'producer.network.request',
            'producer.network.request_timeout',
            'producer.network.request_queue_size',
            'producer.batch.start',
        ].forEach((eventName) => {
            this.producers.on(eventName, (event) =>
                this.emit(eventName, event)
            );
        });

        this.subscriptions = new SubscriptionContainer(
            kafka,
            this,
            this.config.subscriptions,
            this.registry
        ).on('error', (error) => this.emit('error', error));

        [
            'consumer.heartbeat',
            'consumer.commit_offsets',
            'consumer.group_join',
            'consumer.fetch_start',
            'consumer.fetch',
            'consumer.start_batch_process',
            'consumer.end_batch_process',
            'consumer.connect',
            'consumer.disconnect',
            'consumer.stop',
            'consumer.crash',
            'consumer.rebalancing',
            'consumer.received_unsubscribed_topics',
            'consumer.network.request',
            'consumer.network.request_timeout',
            'consumer.network.request_queue_size',
        ].forEach((eventName) => {
            this.subscriptions.on(eventName, (event) =>
                this.emit(eventName, event)
            );
        });
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
    ): Promise<PublishResult[] | null> {
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

        if (Array.isArray(topic)) {
            return this.producers.publish(producerName, {
                ...config,
                topicMessages: topic.map((t) => ({
                    topic: t,
                    messages: encodedMessages,
                })),
            });
        }

        return this.producers.publish(producerName, {
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
        await this.subscriptions.disconnect();
        await this.producers.disconnect();
    }
}
