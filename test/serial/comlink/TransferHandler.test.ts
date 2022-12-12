import * as Comlink from 'comlink';
import { jest, expect, test } from '@jest/globals';
import User from '../../fixtures/User';
import TestWorker from '../../fixtures/Worker';
import { WorkerFactory } from '../../fixtures/WorkerFactory';
import ComlinkSerializer, { SerializableArray, SerializableMap } from '../../../src';

type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;

let worker: Worker;
let testWorker: Comlink.Remote<TestWorker>;
ComlinkSerializer.registerTransferHandler({ transferClasses: [User] });

describe('Comlink passthrough', () => {
	beforeAll(async () => {
		worker = WorkerFactory.get();
		const comlinkWorker = Comlink.wrap(worker) as WorkerFacade<TestWorker>;
		testWorker = await new comlinkWorker();
	});

	afterAll(() => {
		worker.terminate();
	});

	test('Check that User object can pass through Comlink', async () => {
		const user = new User('foo@example.org', 'Bob', 'Smith');
		const userFromWorker = await testWorker.getUser(user);
		expect(userFromWorker).toBeInstanceOf(User);
		expect((userFromWorker as any).isSerializable).toBeTruthy();
		expect(userFromWorker.firstName).toBe('Bob');
		expect(userFromWorker.email).toBe('foo@example.org');
		expect(userFromWorker.firstName).toBe('Bob');
		expect(userFromWorker.lastName).toBe('Smith');
	});

	test('Check that User array can pass through Comlink', async () => {
		const arr = new SerializableArray<User>(
			new User('foo@example.org', 'Bob', 'Smith'),
			new User('foo2@example.org', 'Bob2', 'Smith2')
		);
		const arrFromWorker = await testWorker.getArray(arr);
		expect(arrFromWorker).toBeInstanceOf(SerializableArray);
		expect(arrFromWorker[0]).toBeInstanceOf(User);
		expect(arrFromWorker[1]).toBeInstanceOf(User);
		expect(arrFromWorker[0].email).toBe('foo@example.org');
		expect(arrFromWorker[1].email).toBe('foo2@example.org');
	});

	test('Check that User map can pass through Comlink', async () => {
		const map = new SerializableMap<string, User>([
			['foo', new User('foo@example.org', 'Bob', 'Smith')],
			['foo2', new User('foo2@example.org', 'Bob2', 'Smith2')],
		]);
		const mapFromWorker = await testWorker.getMap(map);
		expect(mapFromWorker).toBeInstanceOf(SerializableMap);
		expect(mapFromWorker.get('foo')).toBeInstanceOf(User);
		expect(mapFromWorker.get('foo2')).toBeInstanceOf(User);
		expect(mapFromWorker.get('foo')?.email).toBe('foo@example.org');
		expect(mapFromWorker.get('foo2')?.email).toBe('foo2@example.org');
	});
});
