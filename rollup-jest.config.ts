// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import type { RollupOptions } from 'rollup';
import { getTsconfig } from 'get-tsconfig';

const tsConfig = getTsconfig()?.config;
const outDir = tsConfig?.compilerOptions ? tsConfig.compilerOptions.outDir : 'dist/not_found';

const rollup: RollupOptions[] = [
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
];

export default rollup;
