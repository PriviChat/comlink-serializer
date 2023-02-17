import HardWorker from 'src/worker/hard.worker';

export interface Test<C extends TestConfig = TestConfig> {
	name: string;
	desc: string;
	defaultConfig: C;
	config: C | undefined;
	route: string;
}

export interface TestSummary {
	name: string;
	duration: number;
	result: any;
}

export interface TestConfig {
	profile: boolean;
	iterations: number;
}

export interface PerfTestProps {
	hardWorker: HardWorker;
}
