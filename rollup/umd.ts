// ./rollup/umd.ts
import terser from '@rollup/plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import type { RollupOptions } from 'rollup';
import { camelCase, capitalize } from 'lodash-es';
import pkg from '../package.json' assert { type: 'json' };

const pkgName = pkg.name;
const outDir = 'dist/lib';

const rollupUmd: RollupOptions[] = [
	{
		input: 'dist/src/esm/index.js',
		external: ['uuid', 'comlink', 'tslib'],
		treeshake: false,
		output: [
			{
				file: `${outDir}/umd/${pkgName}.js`,
				name: capitalize(camelCase(pkgName)),
				exports: 'named',
				format: 'umd',
				globals: {
					uuid: 'uuid',
					comlink: 'comlink',
					tslib: 'tslib',
				},
				sourcemap: false,
			},
			{
				file: `${outDir}/umd/${pkgName}.min.js`,
				name: capitalize(camelCase(pkgName)),
				exports: 'named',
				format: 'umd',
				globals: {
					uuid: 'uuid',
					comlink: 'comlink',
					tslib: 'tslib',
				},
				plugins: [terser()],
				sourcemap: false,
			},
		],
		plugins: [nodeResolve()],
	},
];

export default rollupUmd;
