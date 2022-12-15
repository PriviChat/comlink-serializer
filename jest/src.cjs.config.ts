import type { JestConfigWithTsJest } from 'ts-jest';
import baseJestConfig from './base.config';

const bundleJestConfig: JestConfigWithTsJest = {
	...baseJestConfig,
};

export default bundleJestConfig;
