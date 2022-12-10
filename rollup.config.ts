// rollup.config.js
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';
import { camelCase, capitalize } from 'lodash-es';
import type { RollupOptions } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';

//import pkg from './package.json' assert { type: 'json' };
const pkgName = 'comlink-serializer'; //pkg.name;
const outDir = 'dist/lib';

const extensions = ['.js', '.ts'];

const rollup: RollupOptions[] = [
	{
		input: 'dist/esm/src/index.js',
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
		plugins: [nodeResolve({ extensions }), del({ targets: ['dist/esm'], hook: 'buildEnd', verbose: true })],
	},
	{
		input: 'dist/cjs/index.js',
		external: ['uuid', 'comlink', 'tslib'],
		treeshake: true,
		output: [
			{
				file: `${outDir}/cjs/${pkgName}.js`,
				format: 'cjs',
				sourcemap: false,
			},
			{
				file: `${outDir}/cjs/${pkgName}.min.js`,
				format: 'cjs',
				plugins: [terser()],
				sourcemap: false,
			},
		],
		plugins: [nodeResolve({ extensions }), commonjs(), del({ targets: ['dist/cjs'], hook: 'buildEnd', verbose: true })],
	},
	{
		input: 'dist/dts/index.d.ts',
		output: [
			{
				file: `${outDir}/esm/${pkgName}.d.ts`,
				format: 'esm',
			},
		],
		plugins: [dts(), del({ targets: ['dist/dts'], hook: 'buildEnd', verbose: true })],
	},
];

export default rollup;
