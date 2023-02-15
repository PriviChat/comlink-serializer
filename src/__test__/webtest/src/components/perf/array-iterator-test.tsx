import { h } from 'preact';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'preact/hooks';

import { toSerialIterator, toSerialProxy } from 'comlink-serializer';

import HardWorker from '../../worker/hard.worker';

import { PerfTestProps } from './types';
import Address from '../../dto/address';
import { makeArr } from '../../dto';

export type ArrayIteratorTestConfig = {
	items: number;
};

interface ArrayIteratorTestProps extends PerfTestProps {}

const ArrayIteratorTest = () => {
	const hardWorker = useLoaderData() as HardWorker;
	const [searchParams] = useSearchParams();
	const [config, setConfig] = useState<ArrayIteratorTestConfig>();
	const [message, setMessage] = useState<string>();
	const [zipMath, setZipMap] = useState<number>();

	useEffect(() => {
		const configJson = searchParams.get('config');
		console.log(`Config: ${configJson}`);
		if (configJson) {
			setConfig(JSON.parse(configJson));
		}
	}, [searchParams]);

	useEffect(() => {
		if (config && hardWorker) {
			if (!config.items) throw new TypeError('Config is missing `items`');
			const addrArr = makeArr<Address>('addr', config.items);

			hardWorker.processArrayIterator(toSerialIterator(addrArr)).then((result) => {
				setZipMap(result);
			});

			setMessage(`Processing Array Size: ${config.items}`);
		}
	}, [config]);

	return (
		<div>
			<div>{message}</div>
			<div>Zip Total: {zipMath}</div>
		</div>
	);
};

export default ArrayIteratorTest;
