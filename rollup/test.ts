// rollup-jest.config.js
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import type { RollupOptions } from 'rollup';

const pkgName = 'Worker';
const outDir = 'dist/build/lib';

const rollupTest: RollupOptions[] = [
	{
		input: `dist/build/test/fixtures/Worker.js`,
		external: ['uuid', 'comlink', 'tslib'],
		treeshake: true,
		output: [
			{
				file: `${outDir}/cjs/${pkgName}.cjs`,
				format: 'cjs',
				sourcemap: false,
			},
		],
		plugins: [nodeResolve({ resolveOnly: ['comlink', 'uuid', 'tslib'] }), commonjs()],
	},
];

export default rollupTest;