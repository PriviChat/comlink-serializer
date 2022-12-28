import * as Comlink from 'comlink';
import { jest, expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import WorkerFactory from '@test-fixtures/WorkerFactory';
import TestWorker from '@test-fixtures/TestWorker';
import { SerializedUser } from '@test-fixtures/types';

import ComlinkSerializer, {
	Serialized,
	Serializable,
	SerialArray,
	SerialMap,
	Deserializer,
	_$,
} from '@comlink-serializer';
import IdMap from '@test-fixtures/IdMap';

type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;

let worker: Worker;
let testWorker: Comlink.Remote<TestWorker>;

ComlinkSerializer.registerTransferHandler({ transferClasses: [User] });

type SerializeFn<T> = () => T;
type DeserializeFn = (serialObj: Serialized) => Serializable;

describe('IterableTransferHandler unit tests', () => {
	test('canHandle checks isIterable', () => {
		const handler = _$.iterableTransferHandler.handler;
		expect(handler.canHandle(undefined)).toBe(false);
		expect(handler.canHandle(null)).toBe(false);
		expect(handler.canHandle({})).toBe(false);
		expect(handler.canHandle({ isIterable: false })).toBe(false);
		expect(handler.canHandle({ isIterable: true })).toBe(true);
	});
});

describe('Comlink SerialArray pass-through', () => {
	beforeAll(async () => {
		worker = WorkerFactory.get();
		const comlinkWorker = Comlink.wrap(worker) as WorkerFacade<TestWorker>;
		testWorker = await new comlinkWorker();
	});

	afterAll(() => {
		worker.terminate();
	});

	test('Sum user orders', async () => {
		const user0 = new User('bob0@example.org', 'Bob', 'Smith', 0);
		const user1 = new User('bob1@example.org', 'Bob', 'Smith', 1);
		const user2 = new User('bob2@example.org', 'Bob', 'Smith', 2);
		const user3 = new User('bob3@example.org', 'Bob', 'Smith', 3);
		const array = new SerialArray<User>(user0, user1, user2, user3);
		const total = await testWorker.getTotalOrders(array);
		expect(total).toEqual(6);
	});

	test('Array length check', async () => {
		const user0 = new User('bob0@example.org', 'Bob', 'Smith', 0);
		const user1 = new User('bob1@example.org', 'Bob', 'Smith', 1);
		const user2 = new User('bob2@example.org', 'Bob', 'Smith', 2);
		const user3 = new User('bob3@example.org', 'Bob', 'Smith', 3);
		const array = new SerialArray<User>(user0, user1, user2, user3);
		const length = await testWorker.getArrayLength(array);
		expect(length).toEqual(4);
	});
});
