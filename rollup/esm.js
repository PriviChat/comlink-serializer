// ./rollup/esm.js
const typescript = require('@rollup/plugin-typescript');
const dts = require('rollup-plugin-dts');
const terser = require('@rollup/plugin-terser');
const nodeResolve = require('@rollup/plugin-node-resolve');

const pkg = require('../package.json');
const pkgName = pkg.name;
const srcDir = 'src';
const srcDtsDir = 'build/dts';
const outDir = 'dist/lib/esm';

module.exports = [
	{
		input: `${srcDir}/index.ts`,
		external: Object.keys(pkg.dependencies).concat(Object.keys(pkg.peerDependencies)),
		output: [
			{
				file: `${outDir}/${pkgName}.mjs`,
				format: 'es',
				sourcemap: false,
			},
			{
				file: `${outDir}/${pkgName}.js`,
				format: 'es',
				sourcemap: false,
			},
			{
				file: `${outDir}/${pkgName}.min.js`,
				format: 'es',
				plugins: [terser()],
				sourcemap: false,
			},
		],
		plugins: [typescript(), nodeResolve()],
	},
	{
		input: `${srcDtsDir}/index.d.ts`,
		output: [
			{
				file: `${outDir}/${pkgName}.d.ts`,
				format: 'es',
			},
		],
		plugins: [dts.default()],
	},
];
