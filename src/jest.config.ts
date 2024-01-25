/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ['**/*.ts'],
    coveragePathIgnorePatterns: ['jest.config.ts', 'types.d.ts'],
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    testMatch: ['**/__tests__/**/*.test.ts'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
