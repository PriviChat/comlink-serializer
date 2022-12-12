// ./rollup/dts.ts
import dts from 'rollup-plugin-dts';
import type { RollupOptions } from 'rollup';
import pkg from '../package.json' assert { type: 'json' };

const pkgName = pkg.name;
const outDir = 'dist/lib';

const rollupDts: RollupOptions[] = [
	{
		input: 'dist/src/dts/index.d.ts',
		output: [
			{
				file: `${outDir}/esm/${pkgName}.d.ts`,
				format: 'esm',
			},
			{
				file: `${outDir}/dts/${pkgName}.d.ts`,
				format: 'umd',
			},
		],
		plugins: [dts()],
	},
];

export default rollupDts;
