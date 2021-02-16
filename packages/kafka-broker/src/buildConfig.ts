import { KafkaConfig } from 'kafkajs';
import {
    BrokerConfig,
    ConsumerConfig,
    ProducerConfig,
    ProducerMap,
    PublicationConfig,
    PublicationMap,
    RegistryConfig,
    SubscriptionConfig,
    SubscriptionMap,
    TopicConfig,
} from './types';

export interface ConfigProducer {
    kafka: string;
    producer?: ProducerConfig;
}

export interface ConfigSubscription extends SubscriptionConfig {
    kafka: string;
    consumer: ConsumerConfig;
    topics: TopicConfig[];
}

export interface ConfigPublication extends PublicationConfig {
    producer: string;
}

export interface Config {
    namespace: string;
    kafka: Record<string, KafkaConfig>;
    registry?: RegistryConfig;
    producers: Record<string, ConfigProducer>;
    publications: Record<string, ConfigPublication>;
    subscriptions: Record<string, ConfigSubscription>;
}

export const buildKafka = (
    config: KafkaConfig,
    clientId: string
): KafkaConfig => ({ clientId, ...config });

export const buildProducers = (
    producers: ProducerMap = {},
    kafka = 'default'
): Config['producers'] => ({
    default: { kafka },
    ...Object.fromEntries(
        Object.entries(producers).map(([name, producerConfig]) => [
            name,
            { kafka, producer: producerConfig },
        ])
    ),
});

export const buildPublications = (
    publications: PublicationMap = {},
    producer = 'default'
): Config['publications'] =>
    Object.fromEntries(
        Object.entries(publications).map(([name, publicationConfig]) =>
            typeof publicationConfig === 'string'
                ? [name, { producer, topic: publicationConfig }]
                : [name, { producer, ...publicationConfig }]
        )
    );

const buildTopics = (
    topics: string | SubscriptionConfig['topics']
): TopicConfig[] => {
    if (typeof topics === 'string') {
        return [{ topic: topics }];
    }

    if (Array.isArray(topics)) {
        return topics.map((topic) =>
            typeof topic === 'string' ? { topic } : topic
        );
    }

    return [topics];
};

const isSubscriptionConfig = (config: unknown): config is SubscriptionConfig =>
    (config as SubscriptionConfig).topics !== undefined;

export const buildSubscriptions = (
    subscriptions: SubscriptionMap = {},
    groupPrefix: string,
    kafka = 'default'
): Config['subscriptions'] =>
    Object.fromEntries(
        Object.entries(subscriptions).map(([name, subscriptionConfig]) => {
            const consumer = { groupId: `${groupPrefix}.${name}` };

            if (isSubscriptionConfig(subscriptionConfig)) {
                return [
                    name,
                    {
                        kafka,
                        consumer: {
                            ...consumer,
                            ...subscriptionConfig.consumer,
                        },
                        ...subscriptionConfig,
                        topics: buildTopics(subscriptionConfig.topics),
                    },
                ];
            }

            return [
                name,
                {
                    kafka,
                    consumer,
                    topics: buildTopics(subscriptionConfig),
                },
            ];
        })
    );

export const buildConfig = ({
    namespace,
    config,
    registry,
    producers,
    publications,
    subscriptions,
}: BrokerConfig): Config => ({
    namespace,
    kafka: {
        default: buildKafka(config, namespace),
    },
    registry,
    producers: buildProducers(producers),
    publications: buildPublications(publications),
    subscriptions: buildSubscriptions(subscriptions, namespace),
});
