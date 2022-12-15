// ./rollup/dts.js
const dts = require('rollup-plugin-dts');

const pkg = require('../package.json');
const pkgName = pkg.name;
const srcDtsDir = 'build/dts';
const outDir = 'dist/lib/dts';

module.exports = [
	{
		input: `${srcDtsDir}/index.d.ts`,
		external: Object.keys(pkg.dependencies).concat(Object.keys(pkg.peerDependencies)),
		output: [
			{
				file: `${outDir}/${pkgName}.d.ts`,
				format: 'umd',
			},
		],
		plugins: [dts.default()],
	},
];
