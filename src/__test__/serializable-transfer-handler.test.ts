import * as Comlink from 'comlink';
import { jest, expect, test } from '@jest/globals';
import User from '@test-fixtures/user';
import WorkerFactory from '@test-fixtures/worker-factory';
import SerializableTestWorker from '@test-fixtures/serializable-test-worker';
import ComlinkSerializer, { Serialized, Serializable } from '@comlink-serializer';

import { serializableTransferHandler } from '../serial/comlink';
import SerialSymbol from '../serial/serial-symbol';
import { makeArr, makeObj } from './fixtures';
import { isSerializableObject } from '../serial/decorators/utils';
import { serialize } from '../serial/utils';
import { SerialArray, SerialMap } from '../serial';

type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;

let worker: Worker;
let testWorker: Comlink.Remote<SerializableTestWorker>;

ComlinkSerializer.registerTransferHandler({ transferClasses: [User] });

type SerializeFn<T> = () => T;
type DeserializeFn<T extends Serializable> = (serialObj: Serialized) => T;

describe('SerializableTransferHandler unit tests', () => {
	test('canHandle checks isSerializable', () => {
		const handler = serializableTransferHandler.handler;
		expect(handler.canHandle(undefined)).toBe(false);
		expect(handler.canHandle(null)).toBe(false);
		expect(handler.canHandle({})).toBe(false);
		expect(handler.canHandle({ [SerialSymbol.serializable]: false })).toBe(false);
		expect(handler.canHandle({ [SerialSymbol.serializable]: true, [SerialSymbol.serialLazy]: true })).toBe(false);
		expect(handler.canHandle({ [SerialSymbol.serializable]: true })).toBe(true);
	});

	test('deserialize throws exception when object is not Serialized', () => {
		const handler = serializableTransferHandler.handler;
		expect(() => {
			handler.deserialize({});
		}).toThrow();
	});
});

describe('Comlink pass-through', () => {
	beforeAll(async () => {
		worker = WorkerFactory.getSerializableTestWorker();
		const comlinkWorker = Comlink.wrap(worker) as WorkerFacade<SerializableTestWorker>;
		testWorker = await new comlinkWorker();
	});

	afterAll(() => {
		worker.terminate();
	});

	test('Check that User object can pass through Comlink', async () => {
		const user0 = makeObj<User>('user', 0);

		const rtnUser = await testWorker.getUser(user0);
		expect(rtnUser).toBeInstanceOf(User);
		expect((rtnUser as any)[SerialSymbol.serializable]).toBeTruthy();
		expect(rtnUser.email).toBe(user0.email);
		expect(rtnUser.firstName).toBe(user0.firstName);
		expect(rtnUser.lastName).toBe(user0.lastName);
		expect(rtnUser.totalOrders).toBe(user0.totalOrders);
	});

	test('Check that User array can pass through Comlink (index)', async () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const userArr = new Array<User>(user0, user1);

		const rtnArr = await testWorker.getArray(serialize(userArr));
		expect(rtnArr).toBeInstanceOf(SerialArray);
		expect((rtnArr as any)[SerialSymbol.serializable]).toBeTruthy();
		expect(rtnArr[0]).toBeInstanceOf(User);
		expect(rtnArr[0].email).toBe(user0.email);
		expect(rtnArr[0].firstName).toBe(user0.firstName);
		expect(rtnArr[0].lastName).toBe(user0.lastName);
		expect(rtnArr[0].totalOrders).toBe(user0.totalOrders);
		expect(rtnArr[1]).toBeInstanceOf(User);
		expect(rtnArr[1].email).toBe(user1.email);
		expect(rtnArr[1].firstName).toBe(user1.firstName);
		expect(rtnArr[1].lastName).toBe(user1.lastName);
		expect(rtnArr[1].totalOrders).toBe(user1.totalOrders);
	});

	test('Check that User array can pass through Comlink (for-loop)', async () => {
		const userArr = makeArr<User>('user', 5);
		const rtnArr = await testWorker.getArray(serialize(userArr));
		expect(rtnArr).toBeInstanceOf(SerialArray);
		expect((rtnArr as any)[SerialSymbol.serializable]).toBeTruthy();

		let idx = 0;
		for (const user of rtnArr) {
			expect(user).toBeInstanceOf(User);
			expect(user.email).toEqual('bob@email.org_' + idx);
			expect(user.firstName).toEqual('Bob_' + idx);
			expect(user.lastName).toEqual('Smith_' + idx);
			expect(user.totalOrders).toEqual(idx);
			idx++;
		}
	});

	test('Check that Map<string, User> can pass through Comlink', async () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const userMap = new Map([
			['0', user0],
			['1', user1],
		]);

		const rtnMap = await testWorker.getMap(serialize(userMap));
		expect(rtnMap).toBeInstanceOf(SerialMap);
		expect((rtnMap as any)[SerialSymbol.serializable]).toBeTruthy();
		expect(rtnMap.get('0')).toBeInstanceOf(User);
		expect(rtnMap.get('1')).toBeInstanceOf(User);
		expect(rtnMap.get('0')?.email).toBe(user0.email);
		expect(rtnMap.get('1')?.email).toBe(user1.email);
	});

	test('Check that Map<number, User> can pass through Comlink', async () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const userMap = new Map([
			[0, user0],
			[1, user1],
		]);

		const rtnMap = await testWorker.getMap(serialize(userMap));
		expect(rtnMap).toBeInstanceOf(SerialMap);
		expect((rtnMap as any)[SerialSymbol.serializable]).toBeTruthy();
		expect(rtnMap.get(0)).toBeInstanceOf(User);
		expect(rtnMap.get(1)).toBeInstanceOf(User);
		expect(rtnMap.get(0)?.email).toBe(user0.email);
		expect(rtnMap.get(1)?.email).toBe(user1.email);
	});
});
