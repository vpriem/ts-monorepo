const config = require('../../jest.config');

module.exports = {
    ...config,
    globalSetup: './jest.setup.js',
    coverageThreshold: {
        ...config.coverageThreshold,
        global: {
            ...config.coverageThreshold.global,
            branches: 90,
        },
    },
};
