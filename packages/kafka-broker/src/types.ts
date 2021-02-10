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
import { Optional } from './Optional';

export type ProducerConfig = KafkaProducerConfig;

export type MessageConfig = Omit<Message, 'value'>;

export interface PublicationConfig {
    producer?: string;
    topic: string;
    config?: Omit<ProducerRecord, 'topic' | 'messages'>;
    messageConfig?: MessageConfig;
}

export type PublishMessageValue = Buffer | string | null | object;

export interface PublishMessage<V = PublishMessageValue>
    extends Omit<Message, 'value'> {
    value: V;
}

export type ConsumerConfig = KafkaConsumerConfig;

export type ConsumeValue = null | string | object;

export type ConsumePayload = EachMessagePayload;

export type PublishResult = RecordMetadata;

export type Publish = {
    <V = PublishMessageValue>(
        name: string,
        messages: PublishMessage<V>[]
    ): Promise<PublishResult[]>;

    <V = PublishMessageValue>(
        name: string,
        message: PublishMessage<V>
    ): Promise<PublishResult[]>;
};

export interface PublisherInterface {
    publish: Publish;
}

export type Handler<V = ConsumeValue> = (
    value: V,
    payload: ConsumePayload,
    publish: Publish
) => Promise<void>;

export interface TopicConfig extends ConsumerSubscribeTopic {
    alias?: string;
    handler?: Handler;
}

export type RunConfig = Omit<ConsumerRunConfig, 'eachBatch' | 'eachMessage'>;

export interface SubscriptionConfig {
    consumer?: ConsumerConfig;
    topics: TopicConfig | Array<string | TopicConfig>;
    runConfig?: RunConfig;
    handler?: Handler;
    contentType?: 'application/json';
}

export type ProducerMap = Record<string, ProducerConfig>;
export type PublicationMap = Record<string, string | PublicationConfig>;
export type SubscriptionMap = Record<
    string,
    string | SubscriptionConfig['topics'] | SubscriptionConfig
>;

export interface BrokerConfig {
    namespace: string;
    config: KafkaConfig;
    producers?: ProducerMap;
    publications?: PublicationMap;
    subscriptions?: SubscriptionMap;
}

export interface BrokerContainerConfig {
    namespace: string;
    brokers: Record<string, Optional<BrokerConfig, 'namespace'>>;
}

export interface SubscriptionInterface {
    on<V = ConsumeValue>(event: string, listener: Handler<V>): this;

    once<V = ConsumeValue>(event: string, listener: Handler<V>): this;

    off<V = ConsumeValue>(event: string, listener: Handler<V>): this;

    run(): Promise<this>;
}

export interface BrokerInterface extends PublisherInterface {
    emit(event: 'error', error: Error): boolean;

    namespace(): string;

    subscription(name: string): SubscriptionInterface;

    subscriptionList(): SubscriptionInterface;

    shutdown(): Promise<void>;
}
