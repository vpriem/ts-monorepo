import {
    ConsumerConfig as KafkaConsumerConfig,
    ConsumerRunConfig,
    ConsumerSubscribeTopic,
    EachMessagePayload,
    KafkaConfig,
    KafkaMessage,
    Message,
    ProducerConfig as KafkaProducerConfig,
    ProducerRecord,
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

export type ConsumePayload = EachMessagePayload;

export interface ConsumeMessage<V = string | null | object>
    extends Omit<KafkaMessage, 'value'> {
    value: V;
}

export type RunConfig = Omit<ConsumerRunConfig, 'eachBatch' | 'eachMessage'>;

export type Handler = (
    message: ConsumeMessage,
    payload: ConsumePayload
) => void;

export type AsyncHandler = (
    message: ConsumeMessage,
    payload: ConsumePayload
) => Promise<void>;

export interface TopicConfig extends ConsumerSubscribeTopic {
    alias?: string;
    handler?: Handler | AsyncHandler;
}

export interface SubscriptionConfig {
    consumer?: ConsumerConfig;
    topics: string | TopicConfig | Array<string | TopicConfig>;
    runConfig?: RunConfig;
    handler?: Handler | AsyncHandler;
}

export type ProducerMap = Record<string, ProducerConfig>;
export type PublicationMap = Record<string, string | PublicationConfig>;
export type SubscriptionMap = Record<
    string,
    SubscriptionConfig['topics'] | SubscriptionConfig
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
