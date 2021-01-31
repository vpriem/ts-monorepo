import { RecordMetadata } from 'kafkajs';
import { PublishMessage, PublishMessageValue } from './types';
import { Subscription } from './Subscription';
import { SubscriptionList } from './SubscriptionList';

export interface BrokerInterface {
    publish<V = PublishMessageValue>(
        name: string,
        message: PublishMessage<V>
    ): Promise<RecordMetadata[]>;

    publish<V = PublishMessageValue>(
        name: string,
        messages: PublishMessage<V>[]
    ): Promise<RecordMetadata[]>;

    subscription(name: string): Subscription;

    subscriptionList(): SubscriptionList;

    shutdown(): Promise<void>;
}
