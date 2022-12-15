// ./rollup/cjs.js
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');
const nodeResolve = require('@rollup/plugin-node-resolve');

const pkg = require('../package.json');
const pkgName = pkg.name;
const tsconfig = 'tsconfig/cjs.json';
const srcDir = 'src';
const outDir = 'dist/lib/cjs';

module.exports = [
	{
		input: `${srcDir}/index.ts`,
		external: Object.keys(pkg.dependencies).concat(Object.keys(pkg.peerDependencies)),
		output: [
			{
				file: `${outDir}/${pkgName}.cjs`,
				format: 'cjs',
				exports: 'named',
				sourcemap: false,
			},
			{
				file: `${outDir}/${pkgName}.js`,
				format: 'cjs',
				exports: 'named',
				sourcemap: false,
			},
			{
				file: `${outDir}/${pkgName}.min.js`,
				format: 'cjs',
				exports: 'named',
				plugins: [terser()],
				sourcemap: false,
			},
		],
		plugins: [typescript(), nodeResolve()],
	},
];
