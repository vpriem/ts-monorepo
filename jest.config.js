module.exports = {
    testEnvironment: 'node',
    testTimeout: 10000,
    collectCoverageFrom: [
        './src/**/*.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95,
        },
    },
    modulePathIgnorePatterns: ['dist'],
    moduleNameMapper: {
        '@vpriem/(.*)$': '<rootDir>/../$1/src',
    },
    preset: 'ts-jest',
    clearMocks: true,
};
