import {
    ConsumerConfig as KafkaConsumerConfig,
    ConsumerRunConfig,
    ConsumerSubscribeTopic,
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

export type ConsumeMessage = KafkaMessage;

export type ConsumeMessageValue = null | string | object;

export type Handler<V = ConsumeMessageValue> = (
    value: V,
    message: ConsumeMessage,
    topic: string,
    partition: number
) => void;

export type AsyncHandler<V = ConsumeMessageValue> = (
    value: V,
    message: ConsumeMessage,
    topic: string,
    partition: number
) => Promise<void>;

export interface TopicConfig extends ConsumerSubscribeTopic {
    alias?: string;
    handler?: Handler | AsyncHandler;
}

export type RunConfig = Omit<ConsumerRunConfig, 'eachBatch' | 'eachMessage'>;

export interface SubscriptionConfig {
    consumer?: ConsumerConfig;
    topics: TopicConfig | Array<string | TopicConfig>;
    runConfig?: RunConfig;
    handler?: Handler | AsyncHandler;
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
