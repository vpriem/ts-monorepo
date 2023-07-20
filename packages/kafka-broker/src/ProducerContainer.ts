import { Producer, ProducerBatch, ProducerRecord } from 'kafkajs';
import { BatchProducer, isProducerBatch } from './BatchProducer';
import { BrokerError } from './BrokerError';
import { Config, ConfigProducer } from './buildConfig';
import { KafkaContainer } from './KafkaContainer';
import { PublishResult } from './types';

export class ProducerContainer {
    private readonly kafka: KafkaContainer;

    private readonly config: Config['producers'];

    private producers: Record<string, Promise<Producer>> = {};

    private batchProducers: Record<string, BatchProducer | null> = {};

    constructor(kafka: KafkaContainer, config: Config['producers']) {
        this.kafka = kafka;
        this.config = config;
    }

    private async createAndConnect({
        kafka: kafkaName,
        producer: producerConfig,
    }: ConfigProducer): Promise<Producer> {
        const producer = this.kafka.producer(kafkaName, producerConfig);

        await producer.connect();

        return producer;
    }

    private async create(name: string): Promise<Producer> {
        if (typeof this.producers[name] === 'undefined') {
            const producerConfig = this.config[name];
            if (typeof producerConfig === 'undefined') {
                throw new BrokerError(`Unknown producer "${name}"`);
            }

            this.producers[name] = this.createAndConnect(producerConfig);
        }

        return this.producers[name];
    }

    private batchProducer(
        name: string,
        producer: Producer
    ): BatchProducer | null {
        if (typeof this.batchProducers[name] === 'undefined') {
            const { batch: batchConfig } = this.config[name];

            this.batchProducers[name] = batchConfig
                ? new BatchProducer(producer, batchConfig)
                : null;
        }

        return this.batchProducers[name];
    }

    async publish(
        name: string,
        record: ProducerRecord | ProducerBatch
    ): Promise<PublishResult[] | null> {
        const producer = await this.create(name);
        const batchProducer = this.batchProducer(name, producer);

        if (batchProducer) {
            batchProducer.push(record);
            return null;
        }

        return isProducerBatch(record)
            ? producer.sendBatch(record)
            : producer.send(record);
    }

    async disconnect(): Promise<void> {
        const { producers, batchProducers } = this;

        this.producers = {};
        this.batchProducers = {};

        await Promise.all(
            Object.values(batchProducers).map((batchProducer) =>
                batchProducer?.flush()
            )
        );

        await Promise.all(
            Object.values(producers).map(async (getProducer) => {
                const producer = await getProducer;
                return producer.disconnect();
            })
        );
    }
}
