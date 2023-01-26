import * as Comlink from 'comlink';
import { jest, expect, test } from '@jest/globals';
import User from '@test-fixtures/user';
import WorkerFactory from '@test-fixtures/worker-factory';
import IterableTestWorker from '@test-fixtures/iterable-test-worker';
import ComlinkSerializer from '@comlink-serializer';

import { iterableTransferHandler } from '../serial/comlink';
import { makeArr, makeObj } from './fixtures';
import { toSerialIterator } from '../serial/iterable/utils';
import { Serializer } from '../serial';

type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;

let worker: Worker;
let testWorker: Comlink.Remote<IterableTestWorker>;

ComlinkSerializer.registerTransferHandler({ transferClasses: [User] });

describe('IterableTransferHandler unit tests', () => {
	test('canHandle checks iterable', () => {
		const handler = iterableTransferHandler.handler;
		expect(handler.canHandle(undefined)).toBe(false);
		expect(handler.canHandle(null)).toBe(false);
		expect(handler.canHandle({})).toBe(false);
		expect(handler.canHandle([])).toBe(false);
		expect(handler.canHandle(toSerialIterator(new Array()))).toBe(true);
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
		const total = await testWorker.getTotalOrders(toSerialIterator(userArr), 'for-await');
		expect(total).toEqual(totalOrders);
	});

	//TODO not working yet
	/* test('Array sum user orders (reduce)', async () => {
		const total = await testWorker.getTotalOrders(serialIterable(array), 'reduce');
		expect(total).toEqual(totalOrders);
	}); */

	test('Array length check', async () => {
		const userArr = makeArr<User>('user', 5);
		const length = await testWorker.getUserCount(toSerialIterator(userArr));
		expect(length).toEqual(userArr.length);
	});
});
