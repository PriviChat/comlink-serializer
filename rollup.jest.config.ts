// rollup-jest.config.js
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import type { RollupOptions } from 'rollup';

const tsconfig = './tsconfig.jest.json';
const extensions = ['.ts'];

const rollupJest: RollupOptions[] = [
	{
		input: 'test/comlink/Worker.ts',
		output: [
			{
				file: 'jest/test/comlink/Worker.js',
				format: 'cjs',
				sourcemap: false,
			},
		],
		plugins: [nodeResolve({ extensions }), typescript({ tsconfig })],
	},
];

export default rollupJest;
