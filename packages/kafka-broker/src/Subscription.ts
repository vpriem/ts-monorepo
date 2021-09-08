import EventEmitter from 'events';
import { Consumer } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { decodeMessage } from './decodeMessage';
import { ConfigSubscription } from './buildConfig';
import {
    MessageValue,
    Publish,
    PublisherInterface,
    SubscriptionInterface,
    Handler,
} from './types';
import { BrokerError } from './BrokerError';

export class Subscription
    extends EventEmitter
    implements Subscription, SubscriptionInterface
{
    private readonly consumer: Consumer;

    private readonly publisher: PublisherInterface;

    private readonly config: ConfigSubscription;

    private readonly registry?: SchemaRegistry;

    private handlers: Handler[] = [];

    private readonly aliasToTopic: Record<string, string> = {};

    private readonly topicToHandlers: Record<string, Handler[]> = {};

    private isRunning: Promise<this>;

    constructor(
        consumer: Consumer,
        publisher: PublisherInterface,
        config: ConfigSubscription,
        registry?: SchemaRegistry
    ) {
        super({ captureRejections: true });

        this.consumer = consumer;
        this.publisher = publisher;
        this.config = config;
        this.registry = registry;

        if (this.config.handler) {
            this.handlers.push(this.config.handler);
        }

        this.aliasToTopic = Object.fromEntries(
            this.config.topics.map(({ topic, alias }) => [
                alias || topic.toString(),
                topic.toString(),
            ])
        );

        this.topicToHandlers = Object.fromEntries(
            this.config.topics.map(({ topic, handler }) => [
                topic.toString(),
                handler ? [handler] : [],
            ])
        );
    }

    private addHandler(handler: Handler, topicOrAlias?: string) {
        if (topicOrAlias) {
            const topic = this.aliasToTopic[topicOrAlias] || topicOrAlias;
            if (!this.topicToHandlers[topic]) {
                throw new BrokerError(
                    `Unknown topic or alias "${topicOrAlias}"`
                );
            }

            this.topicToHandlers[topic].push(handler);
        } else {
            this.handlers.push(handler);
        }
        return this;
    }

    private removeHandler(handler: Handler, topicOrAlias?: string) {
        if (topicOrAlias) {
            const topic = this.aliasToTopic[topicOrAlias] || topicOrAlias;
            if (!this.topicToHandlers[topic]) {
                throw new BrokerError(
                    `Unknown topic or alias "${topicOrAlias}"`
                );
            }

            this.topicToHandlers[topic] = this.topicToHandlers[topic].filter(
                (h) => h !== handler
            );
        } else {
            this.handlers = this.handlers.filter((h) => h !== handler);
        }
        return this;
    }

    on(event: string | symbol, listener: (...args: any[]) => void): this {
        if (typeof event === 'string' && event.startsWith('message')) {
            return this.addHandler(listener as Handler, event.split('.')[1]);
        }

        return super.on(event, listener);
    }

    off(event: string | symbol, listener: (...args: any[]) => void): this {
        if (typeof event === 'string' && event.startsWith('message')) {
            return this.removeHandler(listener as Handler, event.split('.')[1]);
        }

        return super.off(event, listener);
    }

    private async subscribe(): Promise<void> {
        await this.consumer.connect();

        await Promise.all(
            this.config.topics.map(({ alias, handler, ...topicConfig }) =>
                this.consumer.subscribe(topicConfig)
            )
        );
    }

    private async subscribeAndRun(): Promise<this> {
        const { runConfig, contentType } = this.config;
        const publish = this.publisher.publish.bind(this.publisher) as Publish;

        await this.subscribe();

        await this.consumer.run({
            ...runConfig,
            eachMessage: async (payload) => {
                const { message, topic } = payload;
                let value: MessageValue;

                try {
                    value = await decodeMessage(
                        message,
                        this.registry,
                        contentType
                    );
                } catch (error) {
                    this.emit('error', error);
                    return;
                }

                const handlers = this.topicToHandlers[topic]
                    ? [...this.handlers, ...this.topicToHandlers[topic]]
                    : this.handlers;

                try {
                    await Promise.all(
                        handlers.map((handler) =>
                            handler(value, payload, publish)
                        )
                    );
                } catch (error) {
                    this.emit('error', error);
                }
            },
        });

        return this;
    }

    async run(): Promise<this> {
        if (typeof this.isRunning === 'undefined') {
            this.isRunning = this.subscribeAndRun();
        }

        return this.isRunning;
    }

    async disconnect(): Promise<void> {
        return this.consumer.disconnect();
    }
}
