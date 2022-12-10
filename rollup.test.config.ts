// rollup-jest.config.js
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import type { RollupOptions } from 'rollup';

const extensions = ['.js'];

const outDir = 'build';
const srcDir = 'build';

const rollupJest: RollupOptions[] = [
	{
		input: `${srcDir}/__tests__/comlink/Worker.js`,
		external: ['uuid', 'comlink', 'tslib'],
		treeshake: true,
		output: [
			{
				file: `${outDir}/Worker.cjs`,
				format: 'cjs',
				sourcemap: false,
			},
		],
		plugins: [nodeResolve({ resolveOnly: ['comlink', 'uuid', 'tslib'] }), commonjs()],
	},
];

export default rollupJest;
