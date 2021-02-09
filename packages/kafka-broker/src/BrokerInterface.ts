import { PublisherInterface } from './types';
import { Subscription } from './Subscription';
import { SubscriptionList } from './SubscriptionList';

export interface BrokerInterface extends PublisherInterface {
    emit(event: 'error', error: Error): boolean;

    namespace(): string;

    subscription(name: string): Subscription;

    subscriptionList(): SubscriptionList;

    shutdown(): Promise<void>;
}
