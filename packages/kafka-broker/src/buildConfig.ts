import {
    BrokerConfig,
    ConsumerConfig,
    ProducerMap,
    PublicationConfig,
    PublicationMap,
    SubscriptionConfig,
    SubscriptionMap,
    TopicConfig,
} from './types';

export interface SubscriptionConfigProcessed extends SubscriptionConfig {
    consumer: ConsumerConfig;
    topics: TopicConfig[];
}

export interface Config extends BrokerConfig {
    producers: ProducerMap;
    publications: Record<
        string,
        PublicationConfig & {
            producer: string;
        }
    >;
    subscriptions: Record<string, SubscriptionConfigProcessed>;
}

const buildPublications = (
    publications: PublicationMap = {}
): Config['publications'] =>
    Object.keys(publications).reduce<Config['publications']>((acc, name) => {
        const publicationConfig = publications[name];
        if (typeof publicationConfig === 'string') {
            acc[name] = {
                producer: 'default',
                topic: publicationConfig,
            };
        } else {
            acc[name] = {
                producer: 'default',
                ...publicationConfig,
            };
        }
        return acc;
    }, {});

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
    typeof config === 'object' &&
    (config as SubscriptionConfig).topics !== undefined;

const buildSubscriptions = (
    subscriptions: SubscriptionMap = {},
    namespace: string
): Config['subscriptions'] =>
    Object.keys(subscriptions).reduce<Config['subscriptions']>((acc, name) => {
        const consumer = { groupId: `${namespace}.${name}` };
        const subscriptionConfig = subscriptions[name];

        if (isSubscriptionConfig(subscriptionConfig)) {
            acc[name] = {
                consumer: {
                    ...consumer,
                    ...subscriptionConfig.consumer,
                },
                ...subscriptionConfig,
                topics: buildTopics(subscriptionConfig.topics),
            };
        } else {
            acc[name] = {
                consumer,
                topics: buildTopics(subscriptionConfig),
            };
        }

        return acc;
    }, {});

export const buildConfig = (config: BrokerConfig): Config => ({
    ...config,
    config: {
        clientId: config.namespace,
        ...config.config,
    },
    producers: {
        default: {},
        ...config.producers,
    },
    publications: buildPublications(config.publications),
    subscriptions: buildSubscriptions(config.subscriptions, config.namespace),
});
