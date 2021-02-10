import { Producer } from 'kafkajs';
import { BrokerError } from './BrokerError';
import { Config, ConfigProducer } from './buildConfig';
import { KafkaContainer } from './KafkaContainer';

export class ProducerContainer {
    private readonly kafka: KafkaContainer;

    private readonly config: Config['producers'];

    private producers: Record<string, Promise<Producer>> = {};

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

    async create(name: string): Promise<Producer> {
        if (typeof this.producers[name] === 'undefined') {
            const producerConfig = this.config[name];
            if (typeof producerConfig === 'undefined') {
                throw new BrokerError(`Unknown producer "${name}"`);
            }

            this.producers[name] = this.createAndConnect(producerConfig);
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
