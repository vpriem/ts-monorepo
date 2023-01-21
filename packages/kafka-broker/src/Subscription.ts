import EventEmitter from 'events';
import {
    Consumer,
    EachBatchHandler,
    EachBatchPayload,
    EachMessageHandler,
    EachMessagePayload,
    KafkaJSNonRetriableError,
    KafkaMessage,
} from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { decodeMessage } from './decodeMessage';
import { ConfigSubscription } from './buildConfig';
import {
    Publish,
    PublisherInterface,
    SubscriptionInterface,
    Handler,
} from './types';
import { BrokerError } from './BrokerError';

export class Subscription
    extends EventEmitter
    implements SubscriptionInterface
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

        this.consumer.on('consumer.crash', ({ payload: { error } }) => {
            if (error instanceof KafkaJSNonRetriableError) {
                this.emit('error', error);
            }
        });

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

    private async consumeMessage(payload: EachMessagePayload): Promise<void> {
        const { contentType, deadLetter } = this.config;
        const publish = this.publisher.publish.bind(this.publisher) as Publish;
        const { message, topic } = payload;

        try {
            const value = await decodeMessage(
                message,
                this.registry,
                contentType
            );

            const handlers = this.topicToHandlers[topic]
                ? [...this.handlers, ...this.topicToHandlers[topic]]
                : this.handlers;

            await Promise.all(
                handlers.map((handler) => handler(value, payload, publish))
            );
        } catch (error) {
            if (deadLetter) {
                /**
                 * Cannot emit error without triggering KafkaJs retry mechanism :/
                 */
                // this.emit('error', error);

                await publish(deadLetter, {
                    value: {
                        ...payload,
                        error: (error as Error).message,
                    },
                });

                return;
            }

            throw error;
        }
    }

    private async eachBatchByPartitionKey({
        batch,
        isRunning,
        isStale,
        heartbeat,
        pause,
        resolveOffset,
        commitOffsetsIfNecessary,
    }: EachBatchPayload): Promise<void> {
        const { topic, partition } = batch;
        const messagesByKey: Record<string, KafkaMessage[]> = {};

        batch.messages.forEach((message) => {
            const key = message.key?.toString() || 'no-key';

            if (!messagesByKey[key]) {
                messagesByKey[key] = [];
            }

            messagesByKey[key].push(message);
        });

        await Promise.all(
            Object.values(messagesByKey).map(async (messages) => {
                // eslint-disable-next-line no-restricted-syntax
                for (const message of messages) {
                    if (!isRunning() || isStale()) break;

                    // eslint-disable-next-line no-await-in-loop
                    await this.consumeMessage({
                        topic,
                        partition,
                        message,
                        heartbeat,
                        pause,
                    });

                    resolveOffset(message.offset);
                    // eslint-disable-next-line no-await-in-loop
                    await heartbeat();
                    // eslint-disable-next-line no-await-in-loop
                    await commitOffsetsIfNecessary();
                }
            })
        );
    }

    private async eachBatch({
        batch,
        isRunning,
        isStale,
        heartbeat,
        pause,
        resolveOffset,
        commitOffsetsIfNecessary,
    }: EachBatchPayload): Promise<void> {
        const { topic, partition } = batch;

        await Promise.all(
            batch.messages.map(async (message) => {
                if (!isRunning() || isStale()) return;

                await this.consumeMessage({
                    topic,
                    partition,
                    message,
                    heartbeat,
                    pause,
                });

                resolveOffset(message.offset);
                await heartbeat();
                await commitOffsetsIfNecessary();
            })
        );
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
        const { runConfig, parallelism } = this.config;

        await this.subscribe();

        if (parallelism === 'by-partition-key') {
            await this.consumer.run({
                ...runConfig,
                eachBatch: this.eachBatchByPartitionKey.bind(
                    this
                ) as EachBatchHandler,
            });
        } else if (parallelism === 'all-at-once') {
            await this.consumer.run({
                ...runConfig,
                eachBatch: this.eachBatch.bind(this) as EachBatchHandler,
            });
        } else {
            await this.consumer.run({
                ...runConfig,
                eachMessage: this.consumeMessage.bind(
                    this
                ) as EachMessageHandler,
            });
        }

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
