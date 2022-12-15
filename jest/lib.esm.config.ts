import type { JestConfigWithTsJest } from 'ts-jest';
import baseJestConfig from './base.config';

const esmLibJestConfig: JestConfigWithTsJest = {
	...baseJestConfig,
	preset: 'ts-jest/presets/default-esm',
	extensionsToTreatAsEsm: ['.ts'],
	moduleNameMapper: {
		...baseJestConfig.moduleNameMapper,
		'^(\\.{1,2}/.*)\\.js$': '$1',
		'^@comlink-serializer$': '<rootDir>/dist/lib/esm/comlink-serializer.mjs',
	},
	transform: {
		'^.+\\.[t|j]s?$': [
			'ts-jest',
			{
				tsconfig: '../tsconfig.json',
				useESM: true,
				//isolatedModules: false,
				diagnostics: {
					exclude: ['!src/__test__/**/*.ts'],
					isolatedModules: false,
				},
			},
		],
	},
};

export default esmLibJestConfig;
