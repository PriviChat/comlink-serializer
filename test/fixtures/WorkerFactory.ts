import Worker from 'web-worker';

export class WorkerFactory {
	public static get(): Worker {
		return new Worker('./dist/build/lib/cjs/Worker.cjs', { type: 'module' });
		//return new Worker('./dist/lib/umd/comlink-serializer.cjs', { type: 'module' });
	}
}
