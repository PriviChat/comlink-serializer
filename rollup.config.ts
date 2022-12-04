// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import type { RollupOptions } from 'rollup';
import { camelCase, capitalize } from 'lodash-es';
import { getTsconfig } from 'get-tsconfig';
import pkg from './package.json' assert { type: 'json' };

const tsConfig = getTsconfig()?.config;
const outDir = tsConfig?.compilerOptions ? tsConfig.compilerOptions.outDir : 'dist/not_found';
const declDir = tsConfig?.compilerOptions ? tsConfig.compilerOptions.declarationDir : 'dist/not_found';

const rollup: RollupOptions[] = [
	{
		input: 'src/index.ts',
		output: [
			{
				name: capitalize(camelCase(pkg.name)),
				exports: 'named',
				file: `${outDir}/dist/${pkg.name}.js`,
				format: 'umd',
				sourcemap: true,
			},
			{
				file: `${outDir}/dist/${pkg.name}.esm.js`,
				format: 'es',
				sourcemap: true,
			},
		],
		external: ['uuid'],
		plugins: [
			// Allow json resolution
			json(),
			// Compile TypeScript files
			typescript({ sourceMap: true }),
			// Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
			commonjs(),
			// Allow node_modules resolution, so you can use 'external' to control
			// which external modules to include in the bundle
			// https://github.com/rollup/plugins/tree/master/packages/node-resolve#usag
			nodeResolve({
				browser: true,
			}),
			terser({
				compress: true,
				mangle: true,
				ecma: 2015,
				keep_classnames: true,
				sourceMap: true,
			}),
			copy({
				targets: [{ src: ['package.json', 'README.md', 'LICENSE'], dest: 'build' }],
			}),
		],
	},
	{
		input: 'test/comlink/Worker.ts',
		output: [
			{
				file: `${outDir}/test/comlink/Worker.js`,
				format: 'es',
				sourcemap: false,
			},
		],
		plugins: [typescript({ declaration: false })],
	},
	{
		input: `${outDir}/dist/${declDir}/src/index.d.ts`,
		output: [{ file: `${outDir}/dist/${pkg.name}.d.ts`, format: 'es' }],
		plugins: [dts(), del({ targets: [`${outDir}/dist/dts`], hook: 'buildEnd' })],
	},
];

export default rollup;
