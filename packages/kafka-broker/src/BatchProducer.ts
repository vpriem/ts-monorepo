import EventEmitter from 'events';
import {
    Message,
    Producer,
    ProducerBatch,
    ProducerRecord,
    RecordMetadata,
    TopicMessages,
} from 'kafkajs';
import { BatchConfig } from './types';

export const isProducerBatch = (
    record: ProducerRecord | ProducerBatch
): record is ProducerBatch =>
    typeof (record as ProducerBatch).topicMessages !== 'undefined';

interface SingleTopicMessage {
    topic: string;
    message: Message;
}

const toSingleTopicMessage = (
    topic: string,
    messages: Message[]
): SingleTopicMessage[] => messages.flatMap((message) => ({ topic, message }));

const noop = () => {
    /** */
};

export declare interface BatchProducer {
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'batch.start', listener: (event: ProducerBatch) => void): this;
}

export class BatchProducer extends EventEmitter {
    private readonly producer: Producer;

    private topicMessages: SingleTopicMessage[] = [];

    private timer: NodeJS.Timer;

    private hrTime = process.hrtime();

    private isSending = false;

    private readonly batchSize: number;

    private batchRequest: Promise<RecordMetadata[] | void> = Promise.resolve();

    private readonly lingerMs: number;

    private readonly config?: Omit<ProducerBatch, 'topicMessages'>;

    constructor(producer: Producer, batchConfig: BatchConfig) {
        super({ captureRejections: true });

        this.producer = producer;

        const { size, lingerMs, ...config } = batchConfig;

        this.batchSize = size;
        this.lingerMs = lingerMs;
        this.config = config;

        this.producer.on(
            'producer.connect',
            /* istanbul ignore next */ () => this.startAutoSendIfNecessary()
        );

        this.producer.on('producer.disconnect', () =>
            this.stopAutoSendIfNecessary()
        );
    }

    get length(): number {
        return this.topicMessages.length;
    }

    private elapsedMs(): number {
        const [s, ns] = process.hrtime(this.hrTime);
        return s * 1000 + ns / 1000000;
    }

    private async sendIfNecessary(): Promise<void> {
        if (this.isSending) return;

        if (this.topicMessages.length >= this.batchSize) {
            await this.sendAllBatch();
        } else if (this.elapsedMs() >= this.lingerMs) {
            await this.sendOneBatch();
        }
    }

    private startAutoSendIfNecessary(): void {
        if (this.timer) return;

        this.timer = setInterval(() => {
            this.sendIfNecessary()
                .then(noop)
                .catch(
                    /* istanbul ignore next */ (error) =>
                        this.emit('error', error)
                );
        }, this.lingerMs);
    }

    private stopAutoSendIfNecessary(): void {
        clearInterval(this.timer);
    }

    push(record: ProducerRecord | ProducerBatch): void {
        if (isProducerBatch(record)) {
            this.topicMessages.push(
                ...(record.topicMessages ?? []).flatMap(({ topic, messages }) =>
                    toSingleTopicMessage(topic, messages)
                )
            );
        } else {
            this.topicMessages.push(
                ...toSingleTopicMessage(record.topic, record.messages)
            );
        }

        this.sendIfNecessary()
            .then(noop)
            .catch(
                /* istanbul ignore next */ (error) => this.emit('error', error)
            );

        this.startAutoSendIfNecessary();
    }

    private createBatch(topicMessages: SingleTopicMessage[]): ProducerBatch {
        const messagesByTopic: Record<string, TopicMessages> = {};

        topicMessages.forEach(({ topic, message }) => {
            if (!messagesByTopic[topic]) {
                messagesByTopic[topic] = {
                    topic,
                    messages: [],
                };
            }

            messagesByTopic[topic].messages.push(message);
        });

        return {
            ...this.config,
            topicMessages: Object.values(messagesByTopic),
        };
    }

    private async sendBatch(): Promise<void> {
        await this.batchRequest;

        const messages = this.topicMessages.splice(0, this.batchSize);
        if (!messages.length) return;

        this.hrTime = process.hrtime();

        const batch = this.createBatch(messages);
        this.emit('batch.start', batch);

        this.batchRequest = this.producer.sendBatch(batch).catch(
            /* istanbul ignore next */ (error) => {
                this.emit('error', error);
            }
        );
        await this.batchRequest;
        this.batchRequest = Promise.resolve();
    }

    private async sendOneBatch(): Promise<void> {
        this.isSending = true;

        await this.sendBatch();

        this.isSending = false;
    }

    private async sendAllBatch(): Promise<void> {
        this.isSending = true;

        while (this.topicMessages.length >= this.batchSize) {
            // eslint-disable-next-line no-await-in-loop
            await this.sendBatch();
        }

        this.isSending = false;
    }

    async flush(): Promise<void> {
        this.isSending = true;

        while (this.topicMessages.length) {
            // eslint-disable-next-line no-await-in-loop
            await this.sendBatch();
        }

        this.isSending = false;
    }
}
