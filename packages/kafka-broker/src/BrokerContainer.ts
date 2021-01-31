import { RecordMetadata } from 'kafkajs';
import {
    BrokerContainerConfig,
    PublishMessage,
    PublishMessageValue,
} from './types';
import { Broker } from './Broker';
import { BrokerInterface } from './BrokerInterface';
import { BrokerError } from './BrokerError';
import { Subscription } from './Subscription';
import { SubscriptionList } from './SubscriptionList';
import { ContainerConfig, buildContainerConfig } from './buildContainerConfig';

export class BrokerContainer implements BrokerInterface {
    private readonly config: ContainerConfig;

    private brokers: Record<string, Broker> = {};

    constructor(config: BrokerContainerConfig) {
        this.config = buildContainerConfig(config);
    }

    private createBroker(name: string): Broker {
        if (typeof this.brokers[name] === 'undefined') {
            const brokerConfig = this.config.brokers[name];
            if (typeof brokerConfig === 'undefined') {
                throw new BrokerError(`Unknown broker "${name}"`);
            }

            this.brokers[name] = new Broker(brokerConfig);
        }

        return this.brokers[name];
    }

    async publish<V = PublishMessageValue>(
        brokerAndPublicationName: string,
        messageOrMessages: PublishMessage<V> | PublishMessage<V>[]
    ): Promise<RecordMetadata[]> {
        const [brokerName, ...parts] = brokerAndPublicationName.split('/');

        return this.createBroker(brokerName).publish<V>(
            parts.join('/'),
            messageOrMessages
        );
    }

    subscription(brokerAndSubscriptionName: string): Subscription {
        const [brokerName, ...parts] = brokerAndSubscriptionName.split('/');

        return this.createBroker(brokerName).subscription(parts.join('/'));
    }

    subscriptionList(): SubscriptionList {
        const brokers = Object.keys(this.config.brokers);

        const nestedSubscriptions = brokers.map((name) =>
            this.createBroker(name).subscriptionList()
        );

        return new SubscriptionList(...nestedSubscriptions.flat());
    }

    async shutdown(): Promise<void> {
        const { brokers } = this;

        this.brokers = {};

        await Promise.all(
            Object.values(brokers).map((broker) => broker.shutdown())
        );
    }
}
