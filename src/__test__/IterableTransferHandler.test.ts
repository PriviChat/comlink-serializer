import * as Comlink from 'comlink';
import { jest, expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import WorkerFactory from '@test-fixtures/WorkerFactory';
import IterableTestWorker from '@test-fixtures/IterableTestWorker';
import ComlinkSerializer, { toSerialIterable } from '@comlink-serializer';

import { iterableTransferHandler } from '../serial/comlink';

type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;

let worker: Worker;
let testWorker: Comlink.Remote<IterableTestWorker>;

ComlinkSerializer.registerTransferHandler({ transferClasses: [User] });

describe('IterableTransferHandler unit tests', () => {
	test('canHandle checks isIterable', () => {
		const handler = iterableTransferHandler.handler;
		expect(handler.canHandle(undefined)).toBe(false);
		expect(handler.canHandle(null)).toBe(false);
		expect(handler.canHandle({})).toBe(false);
		expect(handler.canHandle([])).toBe(false);
		expect(handler.canHandle(toSerialIterable(new Array()))).toBe(true);
	});
});

describe('SerialArray', () => {
	let user0: User;
	let user1: User;
	let user2: User;
	let user3: User;
	let array: Array<User>;
	let totalOrders: number;

	beforeAll(async () => {
		worker = WorkerFactory.getIterableTestWorker();
		const comlinkWorker = Comlink.wrap(worker) as WorkerFacade<IterableTestWorker>;
		testWorker = await new comlinkWorker();
	});

	beforeEach(() => {
		user0 = new User('bob0@example.org_0', 'Bob_0', 'Smith_0', 0);
		user1 = new User('bob1@example.org_1', 'Bob_1', 'Smith_1', 1);
		user2 = new User('bob2@example.org_2', 'Bob_2', 'Smith_2', 2);
		user3 = new User('bob3@example.org_3', 'Bob_3', 'Smith_3', 3);
		array = new Array<User>(user0, user1, user2, user3);
		totalOrders = array.reduce((accum, user) => {
			return accum + user.totalOrders;
		}, 0);
	});

	afterAll(() => {
		worker.terminate();
	});

	test('Array sum user orders (for-await)', async () => {
		const total = await testWorker.getTotalOrders(toSerialIterable(array), 'for-await');
		expect(total).toEqual(totalOrders);
	});

	//TODO not working yet
	/* test('Array sum user orders (reduce)', async () => {
		const total = await testWorker.getTotalOrders(serialIterable(array), 'reduce');
		expect(total).toEqual(totalOrders);
	}); */

	test('Array length check', async () => {
		const length = await testWorker.getUserCount(toSerialIterable(array));
		expect(length).toEqual(array.length);
	});
});
