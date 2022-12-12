import type { JestConfigWithTsJest } from 'ts-jest';
import baseJestConfig from './base.config';

const bundleJestConfig: JestConfigWithTsJest = {
	...baseJestConfig,
	verbose: true,
	moduleNameMapper: {
		...baseJestConfig.moduleNameMapper,
		'/src$': '<rootDir>/dist/lib/esm/comlink-serializer.js',
	},
};

export default bundleJestConfig;
