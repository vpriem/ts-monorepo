import { buildContainerConfig } from '../buildContainerConfig';

describe('container+config', () => {
    it('should build container config', () => {
        expect(
            buildContainerConfig({
                namespace: 'my-service',
                brokers: {
                    broker1: {
                        config: {
                            brokers: [process.env.KAFKA_BROKER as string],
                        },
                    },
                    broker2: {
                        namespace: 'my-service.broker2',
                        config: {
                            brokers: [process.env.KAFKA_BROKER as string],
                        },
                    },
                },
            })
        ).toEqual({
            namespace: 'my-service',
            brokers: {
                broker1: {
                    namespace: 'my-service',
                    config: {
                        brokers: [process.env.KAFKA_BROKER as string],
                    },
                },
                broker2: {
                    namespace: 'my-service.broker2',
                    config: {
                        brokers: [process.env.KAFKA_BROKER as string],
                    },
                },
            },
        });
    });
});
