import EventEmitter from 'events';
import {
    Message,
    Producer,
    ProducerBatch,
    ProducerRecord,
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

    private readonly lingerMs: number;

    private readonly config?: Omit<ProducerBatch, 'topicMessages'>;

    constructor(producer: Producer, batchConfig: BatchConfig) {
        super({ captureRejections: true });

        this.producer = producer;

        const { size, lingerMs, ...config } = batchConfig;

        this.batchSize = size;
        this.lingerMs = lingerMs;
        this.config = config;

        this.producer.on('producer.connect', () => {
            this.startAutoSendIfNecessary();
        });

        this.producer.on('producer.disconnect', () => {
            this.stopAutoSendIfNecessary();
        });
    }

    get length(): number {
        return this.topicMessages.length;
    }

    private elapsedMs(): number {
        const [, ns] = process.hrtime(this.hrTime);
        return ns / 1000000;
    }

    private async sendIfNecessary(): Promise<void> {
        if (this.isSending) return;

        if (this.topicMessages.length >= this.batchSize) {
            await this.sendAllBatch();
        } else if (this.elapsedMs() >= this.lingerMs) {
            await this.flush();
        }
    }

    private startAutoSendIfNecessary(): void {
        if (this.timer) return;

        this.timer = setInterval(() => {
            this.sendIfNecessary()
                .then(noop)
                .catch((error) => this.emit('error', error));
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
            .catch((error) => this.emit('error', error));

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
        if (this.isSending) return;

        this.isSending = true;

        this.hrTime = process.hrtime();

        if (this.topicMessages.length) {
            const batch = this.createBatch(
                this.topicMessages.splice(0, this.batchSize)
            );
            this.emit('batch.start', batch);

            try {
                await this.producer.sendBatch(batch);
            } catch (error) {
                this.emit('error', error);
            }
        }

        this.isSending = false;
    }

    private async sendAllBatch(): Promise<void> {
        while (this.topicMessages.length >= this.batchSize) {
            // eslint-disable-next-line no-await-in-loop
            await this.sendBatch();
        }
    }

    async flush(): Promise<void> {
        while (this.topicMessages.length) {
            // eslint-disable-next-line no-await-in-loop
            await this.sendBatch();
        }
    }
}
