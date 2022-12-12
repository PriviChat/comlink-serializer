import type { JestConfigWithTsJest } from 'ts-jest';
import baseJestConfig from './base.config';

const bundleJestConfig: JestConfigWithTsJest = {
	...baseJestConfig,
	verbose: true,
	moduleNameMapper: {
		...baseJestConfig.moduleNameMapper,
		'^@comlink-serializer$': '<rootDir>/dist/lib/esm/comlink-serializer.mjs',
	},
};

export default bundleJestConfig;
