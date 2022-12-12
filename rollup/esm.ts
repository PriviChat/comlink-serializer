// ./rollup/esm.ts
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import type { RollupOptions } from 'rollup';
import pkg from '../package.json' assert { type: 'json' };

const pkgName = pkg.name;
const srcDir = 'build/src';
const outDir = 'dist/lib';

const extensions = ['.js'];

const rollupEsm: RollupOptions[] = [
	{
		input: `${srcDir}/index.js`,
		external: ['uuid', 'comlink', 'tslib'],
		treeshake: true,
		output: [
			{
				file: `${outDir}/esm/${pkgName}.mjs`,
				format: 'esm',
				sourcemap: false,
			},
			{
				file: `${outDir}/esm/${pkgName}.js`,
				format: 'esm',
				sourcemap: false,
			},
			{
				file: `${outDir}/esm/${pkgName}.min.js`,
				format: 'esm',
				plugins: [terser()],
				sourcemap: false,
			},
		],
		plugins: [nodeResolve({ extensions })],
	},
];

export default rollupEsm;
