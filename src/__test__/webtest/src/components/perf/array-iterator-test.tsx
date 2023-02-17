import { h, Fragment } from 'preact';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'preact/hooks';
import Button from '@mui/material/Button';

import { toSerialIterator, toSerialProxy } from 'comlink-serializer';

import HardWorker from '../../worker/hard.worker';

import { PerfTestProps, Test, TestConfig, TestSummary } from './types';
import Address from '../../dto/address';
import { makeArr } from '../../dto';
import { TEST_QUERY_PARAM } from '.';
import style from './style.css';

export interface ArrayIteratorTestConfig extends TestConfig {
	startSize: number;
	multiplier: number;
}

interface ArrayIteratorTestProps extends PerfTestProps {}

const ArrayIteratorTest = () => {
	const navigate = useNavigate();
	// worker received from route loader
	const hardWorker = useLoaderData() as HardWorker;
	if (!hardWorker) throw TypeError('Worker not found in loader data!');
	// read query string parameters
	const [params] = useSearchParams();
	// parse and store test config from query
	const [test] = useState<Test<ArrayIteratorTestConfig>>(() => {
		const testParam = params.get(TEST_QUERY_PARAM);
		if (testParam) {
			console.log('Test Config Set');
			return JSON.parse(testParam);
		} else {
			throw new TypeError('No Test Config Passed!');
		}
	});
	// init inpector session for profiling
	//const isessionRef = useRef(new inspector.Session());
	const [running, setRunning] = useState<boolean>(false);
	const [complete, setComplete] = useState<boolean>(false);
	const [progress, setProgress] = useState<string>();
	const [testSummary, setTestSummary] = useState<TestSummary[]>([]);
	//const [profile, setProfile] = useState<string>();
	//const [zipMath, setZipMath] = useState<number>(0);

	useEffect(() => {
		if (running) {
			// clear prev results
			setTestSummary([]);
		}
	}, [running]);

	const runTests = async (
		test: Test<ArrayIteratorTestConfig>,
		onStart: () => void,
		afterEach: (summary: TestSummary) => void
	) => {
		const perf = window.performance;
		const iterations = test.config.iterations;
		const multi = test.config.multiplier;
		let size = test.config.startSize;

		onStart();

		for (let idx = 0; idx < iterations; idx++) {
			size = idx ? multi * size : size;
			const name = `Iterator with ${size} elements`;
			const startMark = name + ' - start';
			const endMark = name + ' - end';
			// create array
			const addrArr = makeArr<Address>('addr', size);
			setProgress(name);
			perf.mark(startMark);
			const result = await hardWorker.processArrayIterator(toSerialIterator(addrArr));
			perf.mark(endMark);
			const duration = perf.measure(name, startMark, endMark).duration;
			const summary: TestSummary = {
				name,
				duration,
				result,
			};

			requestAnimationFrame(() => {
				afterEach(summary);
			});
		}
	};

	useEffect(() => {
		if (test) {
			runTests(
				test,
				() => {
					if (test.config.profile) console.profile(test.name);
					setRunning(true);
				},
				(summary) => {
					setTestSummary((value) => [...value, summary]);
				}
			).then(() => {
				if (test.config.profile) console.profileEnd(test.name);
				setRunning(false);
				setComplete(true);
			});
		}
	}, [test]);

	return (
		<div class={style.test}>
			{test && (
				<div class={style.testHeader}>
					<h2>{test.name}</h2>
					<p>{test.desc}</p>
					<p>Running: {running ? 'True' : 'False'}</p>
					<p>Progress: {complete ? 'Complete' : progress}</p>
				</div>
			)}
			<div>
				{testSummary && testSummary.length && (
					<table style="width:80%">
						<thead>
							<tr>
								<th>Name</th>
								<th>Duration</th>
								<th>Result</th>
							</tr>
						</thead>
						<tbody>
							{testSummary.map((value) => (
								<tr>
									<td>{value.name}</td>
									<td>
										{value.duration.toFixed(4)}ms / {(value.duration / 1000).toFixed(2)}s
									</td>
									<td>{JSON.stringify(value.result)}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
			<div>
				{complete && (
					<Button
						variant="contained"
						color="primary"
						onClick={() => {
							navigate('/perf');
						}}
					>
						Clear
					</Button>
				)}
			</div>
		</div>
	);
};

export default ArrayIteratorTest;
