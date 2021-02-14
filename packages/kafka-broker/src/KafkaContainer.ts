import {
    Consumer,
    ConsumerConfig,
    Kafka,
    Producer,
    ProducerConfig,
} from 'kafkajs';
import { Config } from './buildConfig';

export class KafkaContainer {
    private readonly kafkas: Record<string, Kafka> = {};

    constructor(config: Config['kafka']) {
        this.kafkas = Object.fromEntries(
            Object.entries(config).map(([name, kafkaConfig]) => [
                name,
                new Kafka(kafkaConfig),
            ])
        );
    }

    producer(name: string, config?: ProducerConfig): Producer {
        return this.kafkas[name].producer(config);
    }

    consumer(name: string, config: ConsumerConfig): Consumer {
        return this.kafkas[name].consumer(config);
    }
}
