import * as Comlink from 'comlink';
import { jest, expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import WorkerFactory from '@test-fixtures/WorkerFactory';
import TestWorker from '@test-fixtures/TestWorker';
import { SerializedUser } from '@test-fixtures/types';

import ComlinkSerializer, {
	Serialized,
	Serializable,
	SerializableArray,
	SerializableMap,
	Deserializer,
	_$,
} from '@comlink-serializer';

type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;

let worker: Worker;
let testWorker: Comlink.Remote<TestWorker>;

ComlinkSerializer.registerTransferHandler({ transferClasses: [User] });

type SerializeFn<T> = () => T;
type DeserializeFn = (serialObj: Serialized) => Serializable;

describe('handler unit tests', () => {
	test('canHandle checks isSerializable', () => {
		const handler = _$.transferHandler.handler;
		expect(handler.canHandle(undefined)).toBe(false);
		expect(handler.canHandle(null)).toBe(false);
		expect(handler.canHandle({})).toBe(false);
		expect(handler.canHandle({ isSerializable: false })).toBe(false);
		expect(handler.canHandle({ isSerializable: true })).toBe(true);
	});

	test('serialize calls serialize()', () => {
		const handler = _$.transferHandler.handler;
		const user = new User('foo@example.org', 'Bob', 'Smith');

		user.serialize = jest.fn<SerializeFn<SerializedUser>>();
		handler.serialize(user);

		expect(user.serialize).toHaveBeenCalled();
	});

	test('deserialize calls static deserialize()', () => {
		const handler = _$.transferHandler.handler;
		const deserializer = _$.transferHandler.deserializer;
		const user = new User('foo@example.org', 'Bob', 'Smith');

		const originalDeserialize = deserializer.deserialize;
		deserializer.deserialize = jest.fn<DeserializeFn>();
		const serialized = handler.serialize(user)[0];
		handler.deserialize(serialized);

		expect(deserializer.deserialize).toHaveBeenCalled();

		deserializer.deserialize = originalDeserialize;
	});

	test('deserialize throws exception when object is not Serialized', () => {
		const handler = _$.transferHandler.handler;
		expect(() => {
			handler.deserialize({});
		}).toThrow();
	});
});

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
