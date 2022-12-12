import type { JestConfigWithTsJest } from 'ts-jest';

const baseJestConfig: JestConfigWithTsJest = {
	rootDir: '../',
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	testMatch: ['**/*.(test|spec).ts'],
	extensionsToTreatAsEsm: ['.ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
		'^@comlink-serializer$': '<rootDir>/src/index',
		'^@internal/(.*)$': '<rootDir>/src/$1',
		'^@test-fixtures/(.*)$': '<rootDir>/test/fixtures/$1',
	},
	collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/**/index.ts', '!<rootDir>/src/**/types.ts'],
	transform: {
		// '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
		// '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
		'^.+\\.ts?$': [
			'ts-jest',
			{
				tsconfig: '../tsconfig.json',
				useESM: true,
				isolatedModules: false,
				diagnostics: {
					exclude: ['!test/**/*.ts'],
					isolatedModules: false,
				},
			},
		],
	},
};

export default baseJestConfig;
