import EventEmitter from 'events';
import { Consumer } from 'kafkajs';
import { decodeMessage } from './decodeMessage';
import { SubscriptionConfigProcessed } from './buildConfig';
import { ConsumeMessage, ConsumeMessageValue, Handler } from './types';
import { Publisher } from './Publisher';

export interface Subscription {
    emit(event: 'error', error: Error): boolean;

    emit(
        event: string,
        value: ConsumeMessageValue,
        message: ConsumeMessage,
        topic: string,
        partition: number
    ): boolean;

    on<V = ConsumeMessageValue>(event: string, listener: Handler<V>): this;

    once<V = ConsumeMessageValue>(event: string, listener: Handler<V>): this;

    off<V = ConsumeMessageValue>(event: string, listener: Handler<V>): this;
}

export class Subscription extends EventEmitter {
    readonly name: string;

    private readonly consumer: Consumer;

    private readonly publisher: Publisher;

    private readonly config: SubscriptionConfigProcessed;

    private isRunning = false;

    constructor(
        consumer: Consumer,
        publisher: Publisher,
        name: string,
        config: SubscriptionConfigProcessed
    ) {
        super({ captureRejections: true });

        this.consumer = consumer;
        this.publisher = publisher;
        this.name = name;
        this.config = config;

        this.registerHandlers();
    }

    private registerHandlers() {
        if (this.config.handler) {
            this.on('message', this.config.handler.bind(this.publisher));
        }

        this.config.topics.forEach(({ topic, alias, handler }) =>
            handler
                ? this.on(
                      `message.${alias || topic.toString()}`,
                      handler.bind(this.publisher)
                  )
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

        await this.subscribe();

        await this.consumer.run({
            ...runConfig,
            eachMessage: async (payload) => {
                let value: ConsumeMessageValue;
                try {
                    value = decodeMessage(payload.message, contentType);
                } catch (error) {
                    this.emit('error', error);
                    return Promise.resolve();
                }

                this.emit(
                    'message',
                    value,
                    payload.message,
                    payload.topic,
                    payload.partition
                );

                const topicAlias = topicToAlias[payload.topic];
                // istanbul ignore else
                if (topicAlias) {
                    this.emit(
                        `message.${topicAlias}`,
                        value,
                        payload.message,
                        payload.topic,
                        payload.partition
                    );
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
