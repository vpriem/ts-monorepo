import EventEmitter from 'events';
import { Consumer } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { decodeMessage } from './decodeMessage';
import { ConfigSubscription } from './buildConfig';
import {
    MessageValue,
    ConsumePayload,
    Publish,
    PublisherInterface,
    SubscriptionInterface,
} from './types';

export interface Subscription {
    emit(event: 'error', error: Error): boolean;

    emit(
        event: string,
        value: MessageValue,
        payload: ConsumePayload,
        publish: Publish
    ): boolean;
}

export class Subscription
    extends EventEmitter
    implements Subscription, SubscriptionInterface
{
    private readonly consumer: Consumer;

    private readonly publisher: PublisherInterface;

    private readonly config: ConfigSubscription;

    private readonly schemaRegistry?: SchemaRegistry;

    private isRunning = false;

    constructor(
        consumer: Consumer,
        publisher: PublisherInterface,
        config: ConfigSubscription,
        schemaRegistry?: SchemaRegistry
    ) {
        super({ captureRejections: true });

        this.consumer = consumer;
        this.publisher = publisher;
        this.config = config;
        this.schemaRegistry = schemaRegistry;

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
        return Object.fromEntries(
            this.config.topics.map(({ topic, alias }) => [
                topic.toString(),
                alias || topic.toString(),
            ])
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
                let value: MessageValue;

                try {
                    value = await decodeMessage(
                        payload.message,
                        this.schemaRegistry,
                        contentType
                    );
                } catch (error) {
                    this.emit('error', error);
                    return;
                }

                this.emit('message', value, payload, publish);

                const topicAlias = topicToAlias[payload.topic];
                // istanbul ignore else
                if (topicAlias) {
                    this.emit(`message.${topicAlias}`, value, payload, publish);
                }
            },
        });

        return this;
    }

    async disconnect(): Promise<void> {
        return this.consumer.disconnect();
    }
}
