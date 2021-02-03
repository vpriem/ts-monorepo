import EventEmitter from 'events';
import { Consumer } from 'kafkajs';
import { decodeMessage } from './decodeMessage';
import { SubscriptionConfigProcessed } from './buildConfig';
import {
    AsyncHandler,
    ConsumeMessage,
    ConsumeMessageValue,
    Handler,
} from './types';

export interface Subscription {
    emit(
        event: string,
        value: ConsumeMessageValue,
        message: ConsumeMessage,
        topic: string,
        partition: number
    ): boolean;

    on<V = ConsumeMessageValue>(
        event: string,
        listener: Handler<V> | AsyncHandler<V>
    ): this;
}

export class Subscription extends EventEmitter {
    readonly name: string;

    private readonly consumer: Consumer;

    private readonly config: SubscriptionConfigProcessed;

    private isRunning = false;

    constructor(
        consumer: Consumer,
        name: string,
        config: SubscriptionConfigProcessed
    ) {
        super();

        this.consumer = consumer;
        this.name = name;
        this.config = config;

        this.registerHandlers();
    }

    private registerHandlers() {
        if (this.config.handler) {
            this.on('message', this.config.handler);
        }

        this.config.topics.forEach(({ topic, alias, handler }) =>
            handler
                ? this.on(`message.${alias || topic.toString()}`, handler)
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

        const topicToAlias = this.mapTopicToAlias();

        await this.subscribe();

        await this.consumer.run({
            ...this.config.runConfig,
            eachMessage: (payload) => {
                const value = decodeMessage(payload.message);

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
