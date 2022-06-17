import {
    ConsumerConfig as KafkaConsumerConfig,
    ConsumerRunConfig,
    ConsumerSubscribeTopic,
    EachMessagePayload,
    KafkaConfig,
    Message,
    ProducerConfig as KafkaProducerConfig,
    ProducerRecord,
    RecordMetadata,
} from 'kafkajs';
import { SchemaRegistryAPIClientArgs } from '@kafkajs/confluent-schema-registry/dist/api';
import { SchemaRegistryAPIClientOptions } from '@kafkajs/confluent-schema-registry/dist/@types';
import {
    SchemaRegistry,
    SchemaType,
    COMPATIBILITY,
} from '@kafkajs/confluent-schema-registry';

export type { logCreator, logLevel } from 'kafkajs';

export type ProducerConfig = KafkaProducerConfig;

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
    <V = MessageValue>(name: string, messages: PublishMessage<V>[]): Promise<
        PublishResult[]
    >;

    <V = MessageValue>(name: string, message: PublishMessage<V>): Promise<
        PublishResult[]
    >;
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
        event: 'message' | string,
        listener: Handler<V>
    ): this;
    off(event: 'error', listener: (error: Error) => void): this;

    run(): Promise<this>;
}

export interface BrokerInterface extends PublisherInterface {
    namespace(): string;

    schemaRegistry(): SchemaRegistry | undefined;

    subscription(name: string): SubscriptionInterface;

    subscriptionList(): SubscriptionInterface;

    shutdown(): Promise<void>;
}
