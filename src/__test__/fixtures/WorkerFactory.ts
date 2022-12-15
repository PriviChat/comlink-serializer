import Worker from 'web-worker';
export default class WorkerFactory {
	public static get(): Worker {
		//const url = new URL('../../../build/src/__test__/fixtures/Worker.js', import.meta.url);
		//const url = new URL('./Worker.js', import.meta.url.replace('src', 'build/src'));
		//return new WebWorker(url, { type: 'module' });
		return new Worker('./build/cjs/__test__/fixtures/Worker.js');
		//return new Worker(testWorker, { type: 'module' });
		//console.log('URL:' + import.meta.url);
		//console.log('Resolve:' + import.meta.resolve?('./Worker.js'));

		//console.log('URL:' + url);
		//return new Worker(url, { type: 'module' });
	}
}
