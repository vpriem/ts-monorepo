import { BrokerContainerConfig } from './types';
import {
    buildKafka,
    buildProducers,
    buildPublications,
    buildSubscriptions,
    Config,
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    Object.fromEntries(
        Object.entries(brokers)
            .map(([brokerName, { producers }]) =>
                Object.entries(
                    buildProducers(producers, brokerName)
                ).map(([name, config]) => [`${brokerName}/${name}`, config])
            )
            .flat()
    );

const nsPublications = (
    brokers: BrokerContainerConfig['brokers']
): Config['publications'] =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    Object.fromEntries(
        Object.entries(brokers)
            .map(([brokerName, { publications }]) =>
                Object.entries(
                    buildPublications(publications, `${brokerName}/default`)
                ).map(([name, config]) => [`${brokerName}/${name}`, config])
            )
            .flat()
    );

const nsSubscriptions = (
    brokers: BrokerContainerConfig['brokers'],
    groupPrefix: string
): Config['subscriptions'] =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    Object.fromEntries(
        Object.entries(brokers)
            .map(([brokerName, { subscriptions }]) =>
                Object.entries(
                    buildSubscriptions(
                        subscriptions,
                        `${groupPrefix}.${brokerName}`,
                        brokerName
                    )
                ).map(([name, config]) => [`${brokerName}/${name}`, config])
            )
            .flat()
    );

export const buildContainerConfig = ({
    namespace,
    brokers,
}: BrokerContainerConfig): Config => ({
    namespace,
    kafka: nsKafka(brokers, namespace),
    producers: nsProducers(brokers),
    publications: nsPublications(brokers),
    subscriptions: nsSubscriptions(brokers, namespace),
});
