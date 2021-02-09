import { ProducerContainer } from './ProducerContainer';
import {
    PublisherInterface,
    PublishMessage,
    PublishMessageValue,
    PublishResult,
} from './types';
import { BrokerError } from './BrokerError';
import { encodeMessage } from './encodeMessage';
import { Config } from './buildConfig';

export class Publisher implements PublisherInterface {
    private readonly producers: ProducerContainer;

    private readonly config: Config['publications'];

    constructor(producers: ProducerContainer, config: Config['publications']) {
        this.producers = producers;
        this.config = config;
    }

    async publish<V = PublishMessageValue>(
        publicationName: string,
        messageOrMessages: PublishMessage<V> | PublishMessage<V>[]
    ): Promise<PublishResult[]> {
        const publicationConfig = this.config[publicationName];
        if (typeof publicationConfig === 'undefined') {
            throw new BrokerError(`Unknown publication "${publicationName}"`);
        }

        const {
            producer: producerName,
            topic,
            messageConfig,
        } = publicationConfig;

        const producer = await this.producers.create(producerName);

        let messages = Array.isArray(messageOrMessages)
            ? messageOrMessages
            : [messageOrMessages];

        if (messageConfig) {
            messages = messages.map((message) => ({
                ...messageConfig,
                ...message,
            }));
        }

        return producer.send({
            ...publicationConfig.config,
            topic,
            messages: messages.map(encodeMessage),
        });
    }
}
