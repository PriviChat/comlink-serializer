import { Component } from 'preact';
import HardWorker from 'src/worker/hard.worker';

export interface Test<C extends Object = Object> {
	name: string;
	desc: string;
	defaultConfig: C;
	config: C | undefined;
	route: string;
}

export interface PerfTestProps {
	hardWorker: HardWorker;
}
