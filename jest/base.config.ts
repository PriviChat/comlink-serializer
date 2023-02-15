import type { JestConfigWithTsJest } from 'ts-jest';

const baseJestConfig: JestConfigWithTsJest = {
	rootDir: '../',
	setupFilesAfterEnv: ['<rootDir>/jest/jest.setup.ts'],
	clearMocks: true,
	preset: 'ts-jest/presets/default',
	testEnvironment: 'node',
	testMatch: ['<rootDir>/src/__test__/jest/**/*.(test|spec).ts'],
	moduleNameMapper: {
		'^@comlink-serializer$': '<rootDir>/src/index',
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
