// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';
import type { RollupOptions } from 'rollup';
import { camelCase, capitalize } from 'lodash-es';
import { parseTsconfig } from 'get-tsconfig';
import pkg from './package.json' assert { type: 'json' };

const tsconfig = './tsconfig.esm.json';
const tsconfigFile = parseTsconfig(tsconfig);
const outDir = tsconfigFile?.compilerOptions?.outDir ? tsconfigFile.compilerOptions.outDir : 'dist/outDir_not_found';
const declDir = tsconfigFile?.compilerOptions?.declarationDir
	? tsconfigFile.compilerOptions.declarationDir
	: 'dist/declarationDir_not_found';

const rollupEsm: RollupOptions[] = [
	{
		input: `./src/index.ts`,
		external: ['uuid', 'comlink'],
		output: [
			{
				file: `./dist/src/${pkg.name}.js`,
				format: 'es',
				sourcemap: false,
			},
		],
		plugins: [typescript({ tsconfig, declaration: false })],
	},
	{
		input: `./dist/src/${pkg.name}.js`,
		output: [
			{
				file: `./dist/lib/esm/${pkg.name}.mjs`,
				format: 'es',
				sourcemap: true,
				plugins: [
					terser({
						compress: true,
						mangle: true,
						ecma: 2015,
						keep_classnames: true,
						sourceMap: true,
					}),
				],
			},
		],
		plugins: [typescript({ tsconfig })],
	},
	{
		input: `./dist/lib/esm/${declDir}/src/index.d.ts`,
		output: [{ file: `./dist/lib/esm/${pkg.name}.d.ts`, format: 'es' }],
		plugins: [dts()],
	},
	{
		input: './dist',
		plugins: [del({ targets: ['./dist/**/work'], hook: 'buildEnd' })],
	},
];

export default rollupEsm;
