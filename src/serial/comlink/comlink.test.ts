import Worker from 'web-worker';
import * as Comlink from 'comlink';
import { expect, test } from '@jest/globals';
import { User } from '../../../test/fixtures/User';
import { TestWorker } from '../../../test/comlink/worker';
import { serializableObjectTransferHandler } from './handler';

type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;

let worker: Worker;
let testWorker: Comlink.Remote<TestWorker>;

describe('Comlink', () => {
	beforeAll(() => {
		Comlink.transferHandlers.set('SerializableObject', serializableObjectTransferHandler);
	});
	beforeEach(async () => {
		worker = new Worker('./lib/test/comlink/user.worker.js');
		const comlinkWorker = Comlink.wrap(worker) as WorkerFacade<TestWorker>;
		testWorker = await new comlinkWorker();
	});
	afterEach(() => {
		worker.terminate();
	});

	test('Check that User object can pass through Comlink', async () => {
		const user = new User('foo@example.org', 'Bob', 'Smith');

		const userFromWorker = await testWorker.getUser(user);
		expect(userFromWorker).toBeInstanceOf(User);
		expect(userFromWorker.email).toBe('foo@example.org');
		expect(userFromWorker.firstName).toBe('Bob');
		expect(userFromWorker.lastName).toBe('Smith');
	});
});
