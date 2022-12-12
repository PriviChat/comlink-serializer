import WebWorker from 'web-worker';
export default class WorkerFactory {
	public static get(): Worker {
		const url = new URL('../../build/test/fixtures/Worker.js', import.meta.url);
		return new WebWorker(url, { type: 'module' });
		//return new Worker('./build/test/fixtures/Worker.js', { type: 'module' });
		//return new Worker(testWorker, { type: 'module' });
		//console.log('URL:' + import.meta.url);
		//console.log('Resolve:' + import.meta.resolve?('./Worker.js'));

		//console.log('URL:' + url);
		//return new Worker(url, { type: 'module' });
	}
}
