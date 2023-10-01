import {
    CompressionTypes,
    ConnectEvent,
    ConsumerCommitOffsetsEvent,
    ConsumerConfig as KafkaConsumerConfig,
    ConsumerCrashEvent,
    ConsumerEndBatchProcessEvent,
    ConsumerFetchEvent,
    ConsumerFetchStartEvent,
    ConsumerGroupJoinEvent,
    ConsumerHeartbeatEvent,
    ConsumerRebalancingEvent,
    ConsumerReceivedUnsubcribedTopicsEvent,
    ConsumerRunConfig,
    ConsumerStartBatchProcessEvent,
    ConsumerSubscribeTopic,
    DisconnectEvent,
    EachMessagePayload,
    InstrumentationEvent,
    KafkaConfig,
    Message,
    ProducerBatch,
    ProducerConfig as KafkaProducerConfig,
    ProducerRecord,
    RecordMetadata,
    RequestEvent,
    RequestQueueSizeEvent,
    RequestTimeoutEvent,
} from 'kafkajs';
import { SchemaRegistryAPIClientArgs } from '@kafkajs/confluent-schema-registry/dist/api';
import { SchemaRegistryAPIClientOptions } from '@kafkajs/confluent-schema-registry/dist/@types';
import {
    SchemaRegistry,
    SchemaType,
    COMPATIBILITY,
} from '@kafkajs/confluent-schema-registry';

export type { logCreator, logLevel } from 'kafkajs';

export { CompressionTypes };

export interface BatchConfig {
    size: number;
    lingerMs: number;
    acks?: -1 | 0 | 1;
    timeout?: number;
    compression?: CompressionTypes;
}

export interface ProducerConfig extends KafkaProducerConfig {
    batch?: BatchConfig;
}

export type MessageConfig = Omit<Message, 'value'>;

export interface SchemaId {
    id: number;
}

export interface SchemaSubject {
    subject: string;
    version: 'latest' | number;
}

export interface PublicationConfig {
    producer?: string;
    topic: string | string[];
    config?: Omit<ProducerRecord, 'topic' | 'messages'>;
    messageConfig?: MessageConfig;
    schema?: number | string | SchemaId | SchemaSubject;
}

export type MessageValue = Buffer | string | null | object;

export interface PublishMessage<V = MessageValue>
    extends Omit<Message, 'value'> {
    value: V;
}

export interface ConsumerConfig extends Omit<KafkaConsumerConfig, 'groupId'> {
    groupId?: string;
}

export type ConsumePayload = EachMessagePayload;

export type PublishResult = RecordMetadata;

export type Publish = {
    <V = MessageValue>(
        name: string,
        messages: PublishMessage<V>[]
    ): Promise<PublishResult[] | null>;

    <V = MessageValue>(
        name: string,
        message: PublishMessage<V>
    ): Promise<PublishResult[] | null>;
};

export interface PublisherInterface {
    publish: Publish;
}

export type Handler<V = MessageValue> = (
    value: V,
    payload: ConsumePayload,
    publish: Publish
) => Promise<void>;

export interface TopicConfig extends ConsumerSubscribeTopic {
    alias?: string;
    handler?: Handler;
}

export type RunConfig = Omit<ConsumerRunConfig, 'eachBatch' | 'eachMessage'>;

export enum ContentTypes {
    BUFFER = 'application/octet-stream',
    JSON = 'application/json',
    SCHEMA_REGISTRY = 'application/schema-registry',
    TEXT = 'text/plain',
}

export interface SubscriptionConfig {
    consumer?: ConsumerConfig;
    topics: Array<string | TopicConfig>;
    runConfig?: RunConfig;
    handler?: Handler;
    contentType?: ContentTypes | string;
    deadLetter?: string;
    parallelism?: 'by-partition-key' | 'all-at-once';
}

export type ProducerMap = Record<string, ProducerConfig>;
export type PublicationMap = Record<
    string,
    string | string[] | PublicationConfig
>;
export type SubscriptionMap = Record<
    string,
    string | SubscriptionConfig['topics'] | SubscriptionConfig
>;

export { SchemaRegistry, SchemaType, COMPATIBILITY };
export type SchemaRegistryArgs = SchemaRegistryAPIClientArgs;
export type SchemaRegistryOptions = SchemaRegistryAPIClientOptions;
export interface SchemaRegistryConfig extends SchemaRegistryArgs {
    options?: SchemaRegistryOptions;
}

export interface BrokerConfig {
    namespace: string;
    defaults?: {
        producer?: Partial<ProducerConfig>;
        consumer?: Partial<ConsumerConfig>;
    };
    config: KafkaConfig;
    schemaRegistry?: string | SchemaRegistryConfig;
    producers?: ProducerMap;
    publications?: PublicationMap;
    subscriptions?: SubscriptionMap;
}

export interface BrokerContainerConfig {
    namespace: string;
    defaults?: {
        config?: Partial<KafkaConfig>;
        producer?: Partial<ProducerConfig>;
        consumer?: Partial<ConsumerConfig>;
    };
    schemaRegistry?: string | SchemaRegistryArgs | SchemaRegistryConfig;
    brokers: Record<string, Omit<BrokerConfig, 'namespace' | 'schemaRegistry'>>;
}

export interface SubscriptionInterface {
    on<V = MessageValue>(
        event: 'message' | `message.${string}`,
        listener: Handler<V>
    ): this;
    on(event: 'error', listener: (error: Error) => void): this;

    once(event: 'error', listener: (error: Error) => void): this;

    off<V = MessageValue>(
        event: 'message' | `message.${string}`,
        listener: Handler<V>
    ): this;
    off(event: 'error', listener: (error: Error) => void): this;

    run(): Promise<this>;
}

export interface BrokerInterface extends PublisherInterface {
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

    namespace(): string;

    schemaRegistry(): SchemaRegistry | undefined;

    subscription(name: string): SubscriptionInterface;

    subscriptionList(): SubscriptionInterface;

    shutdown(): Promise<void>;
}
