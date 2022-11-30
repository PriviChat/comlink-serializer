import Worker from 'web-worker';
import * as Comlink from 'comlink';
import { expect, test } from '@jest/globals';
import { User } from '../../../test/fixtures/User';
import { TestWorker } from '../../../test/comlink/worker';
import { serializableObjectTransferHandler } from './handler';
import { SerializableArray } from '../../serialobjs';

type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;

let worker: Worker;
let testWorker: Comlink.Remote<TestWorker>;

describe('Comlink', () => {
	beforeAll(() => {
		Comlink.transferHandlers.set('SerializableObject', serializableObjectTransferHandler);
	});
	beforeEach(async () => {
		worker = new Worker('./lib/test/comlink/worker.js');
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

		const arr = new SerializableArray<User>(user, new User('foo2@example.org', 'Bob2', 'Smith2'));
		const arrFromWorker = await testWorker.getArray(arr);
		expect(arrFromWorker).toBeInstanceOf(SerializableArray);
		expect(arrFromWorker[0]).toBeInstanceOf(User);
		expect(arrFromWorker[1]).toBeInstanceOf(User);
		expect(arrFromWorker[0].email).toBe('foo@example.org');
		expect(arrFromWorker[1].email).toBe('foo2@example.org');
	});
});
