// rollup.esm.config.js
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';
import { camelCase, capitalize } from 'lodash-es';
import type { RollupOptions } from 'rollup';
import { parseTsconfig } from 'get-tsconfig';

import pkg from './package.json' assert { type: 'json' };
const pkgName = pkg.name;
//const outDir = 'dist/lib';
//const declDir = 'dist/dts';
const tsconfigFile = parseTsconfig('./tsconfig.json');
const outDir = tsconfigFile?.compilerOptions?.outDir ? tsconfigFile.compilerOptions.outDir : 'dist/outDir_not_found';
const declDir = tsconfigFile?.compilerOptions?.declarationDir
	? tsconfigFile.compilerOptions.declarationDir
	: 'dist/declarationDir_not_found';

const extensions = ['.js', '.ts'];

const rollup: RollupOptions[] = [
	{
		input: `./src/index.ts`,
		external: ['uuid', 'comlink'],
		output: [
			{
				file: `${outDir}/esm/${pkgName}.mjs`,
				format: 'esm',
				sourcemap: false,
			},
			{
				file: `${outDir}/esm/${pkgName}.esm.js`,
				format: 'esm',
				sourcemap: false,
			},
			{
				file: `${outDir}/esm/${pkgName}.esm.min.js`,
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
		plugins: [
			nodeResolve({ extensions }),
			babel({
				babelHelpers: 'bundled',
				include: ['src/**/*.ts'],
				extensions,
				exclude: ['test/**/*.ts', 'src/**/*.test.ts', 'node_modules/**'],
			}),
		],
	},
	{
		input: `${declDir}/src/index.d.ts`,
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
		plugins: [dts(), del({ targets: [`${declDir}`], hook: 'buildEnd', verbose: true })],
	},
];

export default rollup;
