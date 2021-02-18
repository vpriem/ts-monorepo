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

export type ProducerConfig = KafkaProducerConfig;

export type MessageConfig = Omit<Message, 'value'>;

export interface PublicationConfig {
    producer?: string;
    topic: string;
    config?: Omit<ProducerRecord, 'topic' | 'messages'>;
    messageConfig?: MessageConfig;
    schemaId?: number;
}

export type MessageValue = Buffer | string | null | object;

export interface PublishMessage<V = MessageValue>
    extends Omit<Message, 'value'> {
    value: V;
}

export type ConsumerConfig = KafkaConsumerConfig;

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
    SCHEMA_REGISTRY = 'application/sr+avro',
    TEXT = 'text/plain',
}

export interface SubscriptionConfig {
    consumer?: ConsumerConfig;
    topics: TopicConfig | Array<string | TopicConfig>;
    runConfig?: RunConfig;
    handler?: Handler;
    contentType?: ContentTypes | string;
}

export type ProducerMap = Record<string, ProducerConfig>;
export type PublicationMap = Record<string, string | PublicationConfig>;
export type SubscriptionMap = Record<
    string,
    string | SubscriptionConfig['topics'] | SubscriptionConfig
>;

export interface RegistryConfig {
    host: string;
}

export interface BrokerConfig {
    namespace: string;
    defaults?: {
        producer?: Partial<ProducerConfig>;
        consumer?: Partial<ConsumerConfig>;
    };
    config: KafkaConfig;
    registry?: RegistryConfig;
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
    registry?: RegistryConfig;
    brokers: Record<string, Omit<BrokerConfig, 'namespace' | 'registry'>>;
}

export interface SubscriptionInterface {
    on<V = MessageValue>(event: string, listener: Handler<V>): this;

    once<V = MessageValue>(event: string, listener: Handler<V>): this;

    off<V = MessageValue>(event: string, listener: Handler<V>): this;

    run(): Promise<this>;
}

export interface BrokerInterface extends PublisherInterface {
    namespace(): string;

    subscription(name: string): SubscriptionInterface;

    subscriptionList(): SubscriptionInterface;

    shutdown(): Promise<void>;
}
