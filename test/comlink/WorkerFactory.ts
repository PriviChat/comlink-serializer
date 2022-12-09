import Worker from 'web-worker';

export class WorkerFactory {
	public static get(): Worker {
		return new Worker('./jest/Worker.js', { type: 'module' });
		//return new Worker(new URL('./jest/Worker.js', import.meta.url));
	}
}
