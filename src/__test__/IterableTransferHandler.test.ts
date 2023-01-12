import * as Comlink from 'comlink';
import { jest, expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import WorkerFactory from '@test-fixtures/worker-factory';
import IterableTestWorker from '@test-fixtures/IterableTestWorker';
import ComlinkSerializer, { toSerialIterable } from '@comlink-serializer';

import { iterableTransferHandler } from '../serial/comlink';
import { makeArr, makeObj } from './fixtures';

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
	beforeAll(async () => {
		worker = WorkerFactory.getIterableTestWorker();
		const comlinkWorker = Comlink.wrap(worker) as WorkerFacade<IterableTestWorker>;
		testWorker = await new comlinkWorker();
	});

	afterAll(() => {
		worker.terminate();
	});

	test('Array sum user orders (for-await)', async () => {
		const userArr = makeArr<User>('user', 5);
		const totalOrders = userArr.reduce((accum, user) => {
			return accum + user.totalOrders;
		}, 0);
		const total = await testWorker.getTotalOrders(toSerialIterable(userArr), 'for-await');
		expect(total).toEqual(totalOrders);
	});

	//TODO not working yet
	/* test('Array sum user orders (reduce)', async () => {
		const total = await testWorker.getTotalOrders(serialIterable(array), 'reduce');
		expect(total).toEqual(totalOrders);
	}); */

	test('Array length check', async () => {
		const userArr = makeArr<User>('user', 5);
		const length = await testWorker.getUserCount(toSerialIterable(userArr));
		expect(length).toEqual(userArr.length);
	});
});
