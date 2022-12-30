import type { JestConfigWithTsJest } from 'ts-jest';

const baseJestConfig: JestConfigWithTsJest = {
	rootDir: '../',
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	testMatch: ['**/*.(test|spec).ts'],
	moduleNameMapper: {
		'^@comlink-serializer$': '<rootDir>/src/index',
		'^@comlink-serializer-internal$': '<rootDir>/src/internal/index',
		'^@test-fixtures/(.*)$': '<rootDir>/src/__test__/fixtures/$1',
	},
	modulePathIgnorePatterns: ['<rootDir>/build/'],
	collectCoverageFrom: [
		'<rootDir>/src/**/*.ts',
		'!<rootDir>/src/__test__/**',
		'!<rootDir>/src/**/index.ts',
		'!<rootDir>/src/**/types.ts',
	],
	transform: {
		'^.+\\.[t|j]s?$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/tsconfig/cjs.json',
				diagnostics: {
					exclude: ['<rootDir>/src/__test__/**/*.ts'],
					isolatedModules: false,
				},
			},
		],
	},
};

export default baseJestConfig;
