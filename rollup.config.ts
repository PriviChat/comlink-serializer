// rollup.config.js
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';
import { camelCase, capitalize } from 'lodash-es';
import type { RollupOptions } from 'rollup';

import pkg from './package.json' assert { type: 'json' };
const pkgName = pkg.name;
const outDir = 'dist/lib';
const srcDir = 'dist/src';
const declDir = 'dist/dts';

const extensions = ['.js', '.ts'];

const rollup: RollupOptions[] = [
	{
		input: `${srcDir}/esm/src/index.js`,
		external: ['uuid', 'comlink'],
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
			{
				file: `${outDir}/umd/${pkgName}.js`,
				name: capitalize(camelCase(pkgName)),
				exports: 'named',
				format: 'umd',
				globals: {
					uuid: 'uuid',
					comlink: 'comlink',
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
				},
				plugins: [terser()],
				sourcemap: false,
			},
		],
		plugins: [nodeResolve({ extensions }), del({ targets: [srcDir], hook: 'buildEnd', verbose: true })],
	},
	{
		input: `${declDir}/esm/src/index.d.ts`,
		output: [
			{
				file: `${outDir}/esm/${pkgName}.d.ts`,
				format: 'esm',
			},
			{
				file: `${outDir}/umd/${pkgName}.d.ts`,
				format: 'umd',
			},
		],
		plugins: [dts(), del({ targets: [declDir], hook: 'buildEnd', verbose: true })],
	},
];

export default rollup;
