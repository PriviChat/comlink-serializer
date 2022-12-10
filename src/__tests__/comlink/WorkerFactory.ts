import Worker from 'web-worker';

export class WorkerFactory {
	public static get(): Worker {
		return new Worker('./build/Worker.cjs', { type: 'module' });
		//return new Worker(new URL('./Worker.js'), {type: 'module'});
	}
}
