import { BrokerConfig, BrokerContainerConfig } from './types';

export interface ContainerConfig extends BrokerContainerConfig {
    brokers: Record<string, BrokerConfig>;
}

export const buildContainerConfig = ({
    namespace,
    brokers,
}: BrokerContainerConfig): ContainerConfig => ({
    namespace,
    brokers: Object.keys(brokers).reduce<ContainerConfig['brokers']>(
        (acc, brokerName) => {
            acc[brokerName] = {
                namespace,
                ...brokers[brokerName],
            };
            return acc;
        },
        {}
    ),
});
