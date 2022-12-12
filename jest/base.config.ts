import type { JestConfigWithTsJest } from 'ts-jest';

const baseJestConfig: JestConfigWithTsJest = {
	rootDir: '../',
	preset: 'ts-jest/presets/default-esm', // or other ESM presets
	testEnvironment: 'node',
	testMatch: ['**/*.(test|spec).ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	collectCoverageFrom: [
		'<rootDir>/src/**/*.ts',
		'!<rootDir>/src/**/types.ts',
		'!<rootDir>/src/**/index.ts',
		'!<rootDir>/test/fixtures/**/*.ts',
	],
	transform: {
		// '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
		// '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
		'^.+\\.ts?$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/tsconfig/test.json',
				useESM: true,
				isolatedModules: true,
				diagnostics: {
					exclude: ['!**/*.(spec|test).ts', 'test/**/*.ts'],
					isolatedModules: false,
				},
			},
		],
	},
};

export default baseJestConfig;
