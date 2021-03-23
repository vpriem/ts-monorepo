import { KafkaConfig } from 'kafkajs';
import { BrokerContainerConfig, ConsumerConfig, ProducerConfig } from './types';
import {
    buildKafka,
    buildProducers,
    buildPublications,
    buildSubscriptions,
    Config,
    ConfigProducer,
    ConfigPublication,
    ConfigSubscription,
} from './buildConfig';

const nsKafka = (
    brokers: BrokerContainerConfig['brokers'],
    clientId: string,
    defaults?: Partial<KafkaConfig>
): Config['kafka'] =>
    Object.fromEntries(
        Object.entries(brokers).map(([name, { config }]) => [
            name,
            buildKafka({ ...defaults, ...config }, clientId),
        ])
    );

const nsProducers = (
    brokers: BrokerContainerConfig['brokers'],
    defaults?: Partial<ProducerConfig>
): Config['producers'] =>
    Object.fromEntries(
        Object.entries(brokers)
            .map(([brokerName, { producers }]) =>
                Object.entries(
                    buildProducers(producers, brokerName, defaults)
                ).map<[string, ConfigProducer]>(([name, config]) => [
                    `${brokerName}/${name}`,
                    config,
                ])
            )
            .flat()
    );

const nsPublications = (
    brokers: BrokerContainerConfig['brokers']
): Config['publications'] =>
    Object.fromEntries(
        Object.entries(brokers)
            .map(([brokerName, { publications }]) =>
                Object.entries(
                    buildPublications(publications, `${brokerName}/default`)
                ).map<[string, ConfigPublication]>(([name, config]) => [
                    `${brokerName}/${name}`,
                    config,
                ])
            )
            .flat()
    );

const nsSubscriptions = (
    brokers: BrokerContainerConfig['brokers'],
    groupPrefix: string,
    defaults?: Partial<ConsumerConfig>
): Config['subscriptions'] =>
    Object.fromEntries(
        Object.entries(brokers)
            .map(([brokerName, { subscriptions }]) =>
                Object.entries(
                    buildSubscriptions(
                        subscriptions,
                        `${groupPrefix}.${brokerName}`,
                        brokerName,
                        defaults
                    )
                ).map<[string, ConfigSubscription]>(([name, config]) => [
                    `${brokerName}/${name}`,
                    config,
                ])
            )
            .flat()
    );

export const buildContainerConfig = ({
    namespace,
    defaults,
    schemaRegistry,
    brokers,
}: BrokerContainerConfig): Config => ({
    namespace,
    schemaRegistry,
    kafka: nsKafka(brokers, namespace, defaults?.config),
    producers: nsProducers(brokers, defaults?.producer),
    publications: nsPublications(brokers),
    subscriptions: nsSubscriptions(brokers, namespace, defaults?.consumer),
});
