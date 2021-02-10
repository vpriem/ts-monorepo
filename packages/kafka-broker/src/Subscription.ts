import EventEmitter from 'events';
import { Consumer } from 'kafkajs';
import { decodeMessage } from './decodeMessage';
import { SubscriptionConfigProcessed } from './buildConfig';
import {
    ConsumeValue,
    ConsumePayload,
    Publish,
    PublisherInterface,
    SubscriptionInterface,
} from './types';

export interface Subscription {
    emit(event: 'error', error: Error): boolean;

    emit(
        event: string,
        value: ConsumeValue,
        payload: ConsumePayload,
        publish: Publish
    ): boolean;
}

export class Subscription
    extends EventEmitter
    implements Subscription, SubscriptionInterface {
    private readonly consumer: Consumer;

    private readonly publisher: PublisherInterface;

    private readonly config: SubscriptionConfigProcessed;

    private isRunning = false;

    constructor(
        consumer: Consumer,
        publisher: PublisherInterface,
        config: SubscriptionConfigProcessed
    ) {
        super({ captureRejections: true });

        this.consumer = consumer;
        this.publisher = publisher;
        this.config = config;

        this.registerHandlers();
    }

    private registerHandlers() {
        if (this.config.handler) {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            this.on('message', this.config.handler);
        }

        this.config.topics.forEach(({ topic, alias, handler }) =>
            handler
                ? // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  this.on(`message.${alias || topic.toString()}`, handler)
                : undefined
        );
    }

    private mapTopicToAlias(): Record<string, string> {
        return this.config.topics.reduce<Record<string, string>>(
            (acc, { topic, alias }) => {
                acc[topic.toString()] = alias || topic.toString();
                return acc;
            },
            {}
        );
    }

    private async subscribe(): Promise<void> {
        await this.consumer.connect();

        await Promise.all(
            this.config.topics.map((topicConfig) =>
                this.consumer.subscribe(topicConfig)
            )
        );
    }

    async run(): Promise<this> {
        if (this.isRunning) return this;
        this.isRunning = true;

        const { runConfig, contentType } = this.config;
        const topicToAlias = this.mapTopicToAlias();
        const publish = this.publisher.publish.bind(this.publisher) as Publish;

        await this.subscribe();

        await this.consumer.run({
            ...runConfig,
            eachMessage: async (payload) => {
                let value: ConsumeValue;
                try {
                    value = decodeMessage(payload.message, contentType);
                } catch (error) {
                    this.emit('error', error);
                    return Promise.resolve();
                }

                this.emit('message', value, payload, publish);

                const topicAlias = topicToAlias[payload.topic];
                // istanbul ignore else
                if (topicAlias) {
                    this.emit(`message.${topicAlias}`, value, payload, publish);
                }

                return Promise.resolve();
            },
        });

        return this;
    }

    async disconnect(): Promise<void> {
        return this.consumer.disconnect();
    }
}
