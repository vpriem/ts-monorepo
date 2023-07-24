import { v4 as uuid } from 'uuid';
import { CompressionTypes, Kafka } from 'kafkajs';
import { BatchProducer } from '..';

const sleep = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(() => resolve(null), ms);
    });

describe('batch+producer', () => {
    const topic1 = uuid();
    const topic2 = uuid();
    const topic3 = uuid();
    const kafka = new Kafka({
        brokers: [process.env.KAFKA_BROKER as string],
    });
    const producer = kafka.producer();
    const sendBatch = jest.spyOn(producer, 'sendBatch');

    beforeAll(() => producer.connect());

    afterAll(() => producer.disconnect());

    it('should send batch immediately', () => {
        const batchProducer = new BatchProducer(producer, {
            size: 5,
            lingerMs: 24 * 60 * 60,
        });

        const [m1, m2, m3, m4, m5] = [
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
        ];

        batchProducer.push({
            topic: topic1,
            messages: [m1, m2, m3, m4, m5],
        });

        expect(sendBatch).toHaveBeenCalledTimes(1);
        expect(sendBatch).toHaveBeenCalledWith({
            topicMessages: [{ topic: topic1, messages: [m1, m2, m3, m4, m5] }],
        });
        expect(batchProducer.length).toBe(0);
    });

    it('should not exceed batch size', async () => {
        const batchProducer = new BatchProducer(producer, {
            size: 2,
            lingerMs: 24 * 60 * 60,
            acks: 1,
        });

        const [m1, m2, m3, m4, m5] = [
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
        ];

        batchProducer.push({
            topic: topic1,
            messages: [m1, m2, m3, m4, m5],
        });

        await sleep(100);

        expect(sendBatch).toHaveBeenCalledTimes(2);
        expect(sendBatch).toHaveBeenCalledWith({
            acks: 1,
            topicMessages: [{ topic: topic1, messages: [m1, m2] }],
        });
        expect(sendBatch).toHaveBeenCalledWith({
            acks: 1,
            topicMessages: [{ topic: topic1, messages: [m3, m4] }],
        });
        expect(batchProducer.length).toBe(1);
    });

    it('should send batch with multiple topics', () => {
        const batchProducer = new BatchProducer(producer, {
            size: 5,
            lingerMs: 24 * 60 * 60,
            compression: CompressionTypes.GZIP,
        });

        const [m1, m2, m3, m4, m5] = [
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
        ];

        batchProducer.push({
            topic: topic1,
            messages: [m1],
        });

        expect(sendBatch).not.toHaveBeenCalled();
        expect(batchProducer.length).toBe(1);

        batchProducer.push({
            topic: topic2,
            messages: [m2, m3],
        });

        expect(sendBatch).not.toHaveBeenCalled();
        expect(batchProducer.length).toBe(3);

        batchProducer.push({
            topic: topic3,
            messages: [m4, m5],
        });

        expect(sendBatch).toHaveBeenCalledTimes(1);
        expect(sendBatch).toHaveBeenCalledWith({
            compression: CompressionTypes.GZIP,
            topicMessages: [
                { topic: topic1, messages: [m1] },
                { topic: topic2, messages: [m2, m3] },
                { topic: topic3, messages: [m4, m5] },
            ],
        });
        expect(batchProducer.length).toBe(0);
    });

    it('should wait to send batch', async () => {
        const batchProducer = new BatchProducer(producer, {
            size: 5,
            lingerMs: 50,
        });

        const [m1, m2, m3] = [
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
        ];

        batchProducer.push({
            topic: topic1,
            messages: [m1],
        });

        expect(sendBatch).not.toHaveBeenCalled();
        expect(batchProducer.length).toBe(1);

        batchProducer.push({
            topic: topic1,
            messages: [m2, m3],
        });

        expect(sendBatch).not.toHaveBeenCalled();
        expect(batchProducer.length).toBe(3);

        await sleep(45);

        expect(sendBatch).not.toHaveBeenCalled();
        expect(batchProducer.length).toBe(3);

        await sleep(100);

        expect(sendBatch).toHaveBeenCalledTimes(1);
        expect(sendBatch).toHaveBeenCalledWith({
            topicMessages: [{ topic: topic1, messages: [m1, m2, m3] }],
        });
        expect(batchProducer.length).toBe(0);
    });

    it('should flush', async () => {
        const batchProducer = new BatchProducer(producer, {
            size: 5,
            lingerMs: 24 * 60 * 60,
        });

        const [m1, m2, m3, m4] = [
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
        ];

        batchProducer.push({
            topic: topic1,
            messages: [m1, m2, m3, m4],
        });

        expect(sendBatch).not.toHaveBeenCalled();
        expect(batchProducer.length).toBe(4);

        await expect(batchProducer.flush()).resolves.toBeUndefined();

        expect(sendBatch).toHaveBeenCalledTimes(1);
        expect(sendBatch).toHaveBeenCalledWith({
            topicMessages: [{ topic: topic1, messages: [m1, m2, m3, m4] }],
        });
        expect(batchProducer.length).toBe(0);
    });

    it('should send emmit events', async () => {
        const onBatchStart = jest.fn();
        const batchProducer = new BatchProducer(producer, {
            size: 2,
            lingerMs: 24 * 60 * 60,
        }).on('batch.start', onBatchStart);

        const [m1, m2, m3, m4] = [
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
            { value: uuid() },
        ];

        batchProducer.push({
            topic: topic1,
            messages: [m1, m2, m3, m4],
        });

        await sleep(100);

        expect(sendBatch).toHaveBeenCalledTimes(2);
        expect(onBatchStart).toHaveBeenCalledTimes(2);
        expect(onBatchStart).toHaveBeenCalledWith({
            topicMessages: [{ topic: topic1, messages: [m1, m2] }],
        });
        expect(onBatchStart).toHaveBeenCalledWith({
            topicMessages: [{ topic: topic1, messages: [m3, m4] }],
        });
        expect(batchProducer.length).toBe(0);
    });
});
