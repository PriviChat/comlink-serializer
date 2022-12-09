// rollup-jest.config.js
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import type { RollupOptions } from 'rollup';

const extensions = ['.js'];

const outDir = 'jest';
const srcDir = 'jest';

const rollupJest: RollupOptions[] = [
	{
		input: `${srcDir}/test/comlink/Worker.js`,
		treeshake: true,
		output: [
			{
				file: `${outDir}/Worker.js`,
				format: 'esm',
				sourcemap: false,
			},
		],
		plugins: [nodeResolve({ resolveOnly: ['comlink', 'uuid'] }), commonjs()],
	},
];

export default rollupJest;
