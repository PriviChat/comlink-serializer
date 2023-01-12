import Worker from 'web-worker';
export default class WorkerFactory {
	public static getSerializableTestWorker(): Worker {
		//const url = new URL('../../../build/src/__test__/fixtures/Worker.js', import.meta.url);
		//const url = new URL('./Worker.js', import.meta.url.replace('src', 'build/src'));
		//return new WebWorker(url, { type: 'module' });
		return new Worker('./build/cjs/__test__/fixtures/SerializableTestWorker.js');
	}

	public static getIterableTestWorker(): Worker {
		return new Worker('./build/cjs/__test__/fixtures/IterableTestWorker.js');
	}

	public static getLazyTestWorker(): Worker {
		return new Worker('./build/cjs/__test__/fixtures/lazy-test-worker.js');
	}
}
