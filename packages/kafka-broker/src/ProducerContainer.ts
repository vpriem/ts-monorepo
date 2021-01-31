import { Kafka, Producer, ProducerConfig } from 'kafkajs';
import { ProducerMap } from './types';
import { BrokerError } from './BrokerError';

export class ProducerContainer {
    private readonly kafka: Kafka;

    private readonly config: ProducerMap;

    private producers: Record<string, Promise<Producer>> = {};

    constructor(kafka: Kafka, config: ProducerMap) {
        this.kafka = kafka;
        this.config = config;
    }

    private async createAndConnect(config?: ProducerConfig): Promise<Producer> {
        const producer = this.kafka.producer(config);

        await producer.connect();

        return producer;
    }

    async create(name: string): Promise<Producer> {
        if (typeof this.producers[name] === 'undefined') {
            const producerConfig = this.config[name];
            if (typeof producerConfig === 'undefined') {
                throw new BrokerError(`Unknown producer "${name}"`);
            }

            this.producers[name] = this.createAndConnect(producerConfig.config);
        }

        return this.producers[name];
    }

    async disconnect(): Promise<void> {
        const { producers } = this;

        this.producers = {};

        await Promise.all(
            Object.values(producers).map(async (promise) => {
                const producer = await promise;
                return producer.disconnect();
            })
        );
    }
}
