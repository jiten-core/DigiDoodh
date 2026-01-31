// Jest Configuration for DigiDhoodh
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
})

const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',

    // Setup files to run before tests
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

    // Module path aliases
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    // Test file patterns
    testMatch: [
        '**/__tests__/**/*.test.[jt]s?(x)',
        '**/*.test.[jt]s?(x)',
    ],

    // Coverage settings
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/types/**/*',
        '!src/i18n/**/*',
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },

    // Ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
        '/electron-app/',
    ],
}

export default createJestConfig(config)
