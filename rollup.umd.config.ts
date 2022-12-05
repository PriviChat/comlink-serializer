// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';
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
		input: `${outDir}/compiled/esm/src/index.js`,
		output: [
			{
				file: `${outDir}/lib/esm/${pkg.name}.mjs`,
				format: 'es',
				sourcemap: true,
			},
			{
				file: `${outDir}/lib/${pkg.name}.esm.js`,
				format: 'es',
				sourcemap: true,
			},
		],
		plugins: [
			sourcemaps(),
			terser({
				compress: true,
				mangle: true,
				ecma: 2015,
				keep_classnames: true,
				sourceMap: false,
			}),
		],
	},
	{
		input: `${outDir}/compiled/umd/src/index.js`,
		output: [
			{
				file: `${outDir}/lib/umd/${pkg.name}.js`,
				format: 'umd',
				sourcemap: true,
			},
		],
		plugins: [
			sourcemaps(),
			terser({
				compress: true,
				mangle: true,
				ecma: 2015,
				keep_classnames: true,
				sourceMap: false,
			}),
		],
	},
	{
		input: `${outDir}/compiled/esm/${declDir}/src/index.d.ts`,
		output: [
			{ file: `${outDir}/lib/esm/${pkg.name}.d.ts`, format: 'es' },
			{ file: `${outDir}/lib/${pkg.name}.d.ts`, format: 'es' },
		],
		plugins: [
			dts(),
			del({ targets: [`${outDir}/lib/esm/${declDir}`, `${outDir}/lib/umd/${declDir}`], hook: 'buildEnd' }),
		],
	},
	{
		input: `${outDir}/compiled/esm/${declDir}/src/index.d.ts`,
		output: [
			{ file: `${outDir}/lib/esm/${pkg.name}.d.ts`, format: 'es' },
			{ file: `${outDir}/lib/${pkg.name}.d.ts`, format: 'es' },
		],
		plugins: [
			dts(),
			del({ targets: [`${outDir}/lib/esm/${declDir}`, `${outDir}/lib/umd/${declDir}`], hook: 'buildEnd' }),
		],
	},
	{
		input: `${outDir}/lib/esm/${declDir}/src/index.d.ts`,
		output: [{ file: `${outDir}/lib/esm/${pkg.name}.d.ts`, format: 'es' }],
		plugins: [
			dts(),
			del({ targets: [`${outDir}/lib/esm/${declDir}`, `${outDir}/lib/umd/${declDir}`], hook: 'buildEnd' }),
		],
	},
];

export default rollup;
