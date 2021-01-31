module.exports = () => {
    process.env.KAFKA_BROKER = process.env.KAFKA_BROKER || '192.168.0.10:9092';
    process.env.KAFKAJS_LOG_LEVEL = 'nothing';
};
