module.exports = () => {
    process.env.KAFKA_BROKER = '127.0.0.1:9092';
    process.env.KAFKAJS_LOG_LEVEL = 'nothing';
    process.env.SCHEMA_REGISTRY_HOST = 'http://127.0.0.1:8081';
};
