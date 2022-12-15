import type { JestConfigWithTsJest } from 'ts-jest';
import baseJestConfig from './base.config';

const umdLibJestConfig: JestConfigWithTsJest = {
	...baseJestConfig,
	verbose: true,
	moduleNameMapper: {
		...baseJestConfig.moduleNameMapper,
		'^@comlink-serializer$': '<rootDir>/dist/lib/umd/comlink-serializer.js',
	},
};

export default umdLibJestConfig;
