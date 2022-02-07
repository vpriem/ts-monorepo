import { KafkaConfig, ConsumerConfig } from 'kafkajs';
import {
    BrokerConfig,
    ProducerConfig,
    ProducerMap,
    PublicationConfig,
    PublicationMap,
    SchemaId,
    SchemaRegistryConfig,
    SchemaSubject,
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
    schema?: SchemaId | SchemaSubject;
}

export interface Config {
    namespace: string;
    kafka: Record<string, KafkaConfig>;
    schemaRegistry?: SchemaRegistryConfig;
    producers: Record<string, ConfigProducer>;
    publications: Record<string, ConfigPublication>;
    subscriptions: Record<string, ConfigSubscription>;
}

export const buildKafka = (
    config: KafkaConfig,
    clientId: string
): KafkaConfig => ({ clientId, ...config });

export const buildProducers = (
    producers: ProducerMap,
    kafka: string,
    defaults?: Partial<ProducerConfig>
): Config['producers'] => ({
    default: { kafka, producer: defaults },
    ...Object.fromEntries(
        Object.entries(producers).map(([name, producerConfig]) => [
            name,
            { kafka, producer: { ...defaults, ...producerConfig } },
        ])
    ),
});

const buildSchema = (
    schema?: number | string | SchemaId | SchemaSubject
): undefined | SchemaId | SchemaSubject => {
    if (typeof schema === 'number') return { id: schema };
    if (typeof schema === 'string')
        // TODO: parse subject:version
        return { subject: schema, version: 'latest' };
    return schema;
};

export const buildPublications = (
    publications: PublicationMap,
    producer = 'default'
): Config['publications'] =>
    Object.fromEntries(
        Object.entries(publications).map(([name, publicationConfig]) =>
            typeof publicationConfig === 'object' &&
            !Array.isArray(publicationConfig)
                ? [
                      name,
                      {
                          producer,
                          ...publicationConfig,
                          schema: buildSchema(publicationConfig.schema),
                      },
                  ]
                : [name, { producer, topic: publicationConfig }]
        )
    );

const buildTopics = (
    topics: string | SubscriptionConfig['topics']
): TopicConfig[] =>
    typeof topics === 'string'
        ? [{ topic: topics }]
        : topics.map((topic) =>
              typeof topic === 'string' ? { topic } : topic
          );

const isSubscriptionConfig = (config: unknown): config is SubscriptionConfig =>
    typeof (config as SubscriptionConfig).topics !== 'undefined';

export const buildSubscriptions = (
    subscriptions: SubscriptionMap,
    groupPrefix: string,
    kafka: string,
    defaults?: Partial<ConsumerConfig>
): Config['subscriptions'] =>
    Object.fromEntries(
        Object.entries(subscriptions).map(([name, subscriptionConfig]) => {
            const consumer = { ...defaults, groupId: `${groupPrefix}.${name}` };

            if (isSubscriptionConfig(subscriptionConfig)) {
                return [
                    name,
                    {
                        kafka,
                        ...subscriptionConfig,
                        consumer: {
                            ...consumer,
                            ...subscriptionConfig.consumer,
                        },
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

export const buildSchemaRegistry = (
    config?: string | SchemaRegistryConfig
): SchemaRegistryConfig | undefined =>
    typeof config === 'string' ? { host: config } : config;

export const buildConfig = ({
    namespace,
    defaults,
    config,
    schemaRegistry,
    producers = {},
    publications = {},
    subscriptions = {},
}: BrokerConfig): Config => ({
    namespace,
    kafka: {
        default: buildKafka(config, namespace),
    },
    schemaRegistry: buildSchemaRegistry(schemaRegistry),
    producers: buildProducers(producers, 'default', defaults?.producer),
    publications: buildPublications(publications),
    subscriptions: buildSubscriptions(
        subscriptions,
        namespace,
        'default',
        defaults?.consumer
    ),
});
