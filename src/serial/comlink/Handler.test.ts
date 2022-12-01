import Worker from 'web-worker';
import * as Comlink from 'comlink';
import { expect, test } from '@jest/globals';
import { User } from '../../../test/fixtures/User';
import type { TestWorker } from '../../../test/comlink/Worker';
import ComlinkSerializer, { SerializableArray, SerializableMap } from '../..';
import { serializableObjectTransferHandler } from './Handler';
import { Deserializer } from '..';

type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;

let worker: Worker;
let testWorker: Comlink.Remote<TestWorker>;

describe('handler unit tests', () => {
	test('canHandle checks isSerializable', () => {
		const handler = serializableObjectTransferHandler;
		expect(handler.canHandle(undefined)).toBe(false);
		expect(handler.canHandle(null)).toBe(false);
		expect(handler.canHandle({})).toBe(false);
		expect(handler.canHandle({ isSerializable: false })).toBe(false);
		expect(handler.canHandle({ isSerializable: true })).toBe(true);
	});

	test('serialize calls serialize()', () => {
		const handler = serializableObjectTransferHandler;
		const user = new User('foo@example.org', 'Bob', 'Smith');

		user.serialize = jest.fn();
		handler.serialize(user);

		expect(user.serialize).toHaveBeenCalled();
	});

	test('deserialize calls static deserialize()', () => {
		const handler = serializableObjectTransferHandler;
		const user = new User('foo@example.org', 'Bob', 'Smith');

		const originalDeserialize = Deserializer.deserialize;
		Deserializer.deserialize = jest.fn();
		const serialized = handler.serialize(user)[0];
		handler.deserialize(serialized);

		expect(Deserializer.deserialize).toHaveBeenCalled();

		Deserializer.deserialize = originalDeserialize;
	});

	test('deserialize throws exception when object is not Serialized', () => {
		const handler = serializableObjectTransferHandler;
		expect(() => {
			handler.deserialize({});
		}).toThrow();
	});
});

describe('Comlink passthrough', () => {
	beforeAll(() => {
		ComlinkSerializer.registerTransferHandler([User]);
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
