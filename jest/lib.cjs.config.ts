import type { JestConfigWithTsJest } from 'ts-jest';
import baseJestConfig from './base.config';

const cjsLibJestConfig: JestConfigWithTsJest = {
	...baseJestConfig,
	verbose: true,
	moduleNameMapper: {
		...baseJestConfig.moduleNameMapper,
		'^@comlink-serializer$': '<rootDir>/dist/lib/cjs/comlink-serializer.cjs',
	},
};

export default cjsLibJestConfig;
