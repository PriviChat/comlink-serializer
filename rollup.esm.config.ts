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
import { parseTsconfig } from 'get-tsconfig';
import pkg from './package.json' assert { type: 'json' };

const tsConfig = parseTsconfig('./tsconfig.esm.json');
const outDir = tsConfig?.compilerOptions?.outDir ? tsConfig.compilerOptions.outDir : 'dist/outDir_not_found';
const declDir = tsConfig?.compilerOptions?.declarationDir
	? tsConfig.compilerOptions.declarationDir
	: 'dist/declarationDir_not_found';

const rollupEsm: RollupOptions[] = [
	{
		input: `${outDir}/src/index.js`,
		output: [
			{
				file: `build/src/${pkg.name}.esm.js`,
				format: 'es',
				sourcemap: true,
			},
		],
		plugins: [
			terser({
				compress: false,
				mangle: false,
				ecma: 2015,
				sourceMap: true,
			}),
		],
	},
	{
		input: `${outDir}/src/index.js`,
		output: [
			{
				file: `build/lib/esm/${pkg.name}.mjs`,
				format: 'es',
				sourcemap: true,
			},
			{
				file: `build/lib/${pkg.name}.esm.js`,
				format: 'es',
				sourcemap: true,
			},
		],
		plugins: [
			terser({
				compress: true,
				mangle: true,
				ecma: 2015,
				keep_classnames: true,
				sourceMap: { filename: `build/src/${pkg.name}.esm.js` },
			}),
		],
	},
	{
		input: `${outDir}/${declDir}/src/index.d.ts`,
		output: [{ file: `build/lib/esm/${pkg.name}.d.ts`, format: 'es' }],
		plugins: [dts()],
	},
];

export default rollupEsm;
