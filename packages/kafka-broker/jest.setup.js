module.exports = () => {
    process.env.KAFKA_BROKER = 'localhost:9092';
    process.env.KAFKAJS_LOG_LEVEL = 'nothing';
    process.env.SCHEMA_REGISTRY_HOST = 'http://localhost:8081';
};
