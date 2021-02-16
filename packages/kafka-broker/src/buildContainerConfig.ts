import { BrokerContainerConfig } from './types';
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
    clientId: string
): Config['kafka'] =>
    Object.fromEntries(
        Object.entries(brokers).map(([name, { config }]) => [
            name,
            buildKafka(config, clientId),
        ])
    );

const nsProducers = (
    brokers: BrokerContainerConfig['brokers']
): Config['producers'] =>
    Object.fromEntries(
        Object.entries(brokers)
            .map(([brokerName, { producers }]) =>
                Object.entries(buildProducers(producers, brokerName)).map<
                    [string, ConfigProducer]
                >(([name, config]) => [`${brokerName}/${name}`, config])
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
    groupPrefix: string
): Config['subscriptions'] =>
    Object.fromEntries(
        Object.entries(brokers)
            .map(([brokerName, { subscriptions }]) =>
                Object.entries(
                    buildSubscriptions(
                        subscriptions,
                        `${groupPrefix}.${brokerName}`,
                        brokerName
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
    registry,
    brokers,
}: BrokerContainerConfig): Config => ({
    namespace,
    registry,
    kafka: nsKafka(brokers, namespace),
    producers: nsProducers(brokers),
    publications: nsPublications(brokers),
    subscriptions: nsSubscriptions(brokers, namespace),
});
