// ./rollup/umd.js
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');
const nodeResolve = require('@rollup/plugin-node-resolve');
const _ = require('lodash');

const pkg = require('../package.json');
const pkgName = pkg.name;
const srcDir = 'src';
const outDir = 'dist/lib/umd';

module.exports = [
	{
		input: `${srcDir}/index.ts`,
		external: Object.keys(pkg.dependencies).concat(Object.keys(pkg.peerDependencies)),
		output: [
			{
				file: `${outDir}/${pkgName}.js`,
				name: _.capitalize(_.camelCase(pkgName)),
				exports: 'named',
				format: 'umd',
				globals: {
					uuid: 'uuid',
					comlink: 'Comlink',
					tslib: 'tslib',
				},
				sourcemap: false,
			},
			{
				file: `${outDir}/${pkgName}.min.js`,
				name: _.capitalize(_.camelCase(pkgName)),
				exports: 'named',
				format: 'umd',
				globals: {
					uuid: 'uuid',
					comlink: 'Comlink',
					tslib: 'tslib',
				},
				plugins: [terser()],
				sourcemap: false,
			},
		],
		plugins: [nodeResolve(), typescript()],
	},
];
