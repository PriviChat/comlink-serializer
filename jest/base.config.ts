import type { JestConfigWithTsJest } from 'ts-jest';

const baseJestConfig: JestConfigWithTsJest = {
	rootDir: '../',
	//preset: 'ts-jest/presets/default-esm',
	preset: 'ts-jest/presets/default',
	testEnvironment: 'node',
	testMatch: ['**/*.(test|spec).ts'],
	//extensionsToTreatAsEsm: ['.ts'],
	moduleNameMapper: {
		'^@comlink-serializer$': '<rootDir>/src/index',
		'^@test-fixtures/(.*)$': '<rootDir>/src/__test__/fixtures/$1',
	},
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
				tsconfig: '../tsconfig/cjs.json',
				//useESM: true,
				//isolatedModules: false,
				diagnostics: {
					exclude: ['!src/__test__/**/*.ts'],
					isolatedModules: false,
				},
			},
		],
	},
};

export default baseJestConfig;
