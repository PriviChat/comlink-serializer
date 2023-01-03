import * as Comlink from 'comlink';
import { jest, expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import WorkerFactory from '@test-fixtures/WorkerFactory';
import SerializableTestWorker from '@test-fixtures/SerializableTestWorker';
import { SerializedUser } from '@test-fixtures/types';
import ComlinkSerializer, { Serialized, Serializable, toSerialObject } from '@comlink-serializer';

import { serializableTransferHandler } from '../serial/comlink';
import { SerialSymbol } from '../serial';
import { SerialArray, SerialMap } from '../serialobjs';

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
		expect(handler.canHandle({ [SerialSymbol.serializable]: true })).toBe(true);
	});

	test('serialize calls serialize()', () => {
		const handler = serializableTransferHandler.handler;
		const user0 = new User('bob@example.org_0', 'Bob_0', 'Smith_0', 0);
		user0.serialize = jest.fn<SerializeFn<SerializedUser>>();
		handler.serialize(user0);
		expect(user0.serialize).toHaveBeenCalled();
	});

	test('deserialize throws exception when object is not Serialized', () => {
		const handler = serializableTransferHandler.handler;
		expect(() => {
			handler.deserialize({});
		}).toThrow();
	});
});

describe('Comlink passthrough', () => {
	let user0: User;
	let user1: User;
	let userArr0: Array<User>;
	let userMap0: Map<string, User>;
	beforeAll(async () => {
		user0 = new User('bob@example.org_0', 'Bob_0', 'Smith_0', 0);
		user1 = new User('bob@example.org_1', 'Bob_1', 'Smith_1', 1);
		userArr0 = new Array<User>(user0, user1);
		userMap0 = new Map().set('user_0', user0).set('user_1', user1);

		worker = WorkerFactory.getSerializableTestWorker();
		const comlinkWorker = Comlink.wrap(worker) as WorkerFacade<SerializableTestWorker>;
		testWorker = await new comlinkWorker();
	});

	afterAll(() => {
		worker.terminate();
	});

	test('Check that User object can pass through Comlink', async () => {
		const rtnUser = await testWorker.getUser(user0);
		expect(rtnUser).toBeInstanceOf(User);
		expect((rtnUser as any)[SerialSymbol.serializable]).toBeTruthy();
		expect(rtnUser.email).toBe(user0.email);
		expect(rtnUser.firstName).toBe(user0.firstName);
		expect(rtnUser.lastName).toBe(user0.lastName);
		expect(rtnUser.totalOrders).toBe(user0.totalOrders);
	});

	test('Check that User array can pass through Comlink (index)', async () => {
		const rtnArr = await testWorker.getArray(toSerialObject(userArr0));
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
		const rtnArr = await testWorker.getArray(toSerialObject(userArr0));
		expect(rtnArr).toBeInstanceOf(SerialArray);
		expect((rtnArr as any)[SerialSymbol.serializable]).toBeTruthy();

		let idx = 0;
		for (const user of rtnArr) {
			expect(user).toBeInstanceOf(User);
			expect(user.email).toBe('bob@example.org_' + idx);
			expect(user.firstName).toBe('Bob_' + idx);
			expect(user.lastName).toBe('Smith_' + idx);
			expect(user.totalOrders).toBe(idx);
			idx++;
		}
	});

	test('Check that User map can pass through Comlink', async () => {
		const rtnMap = await testWorker.getMap(toSerialObject(userMap0));
		expect(rtnMap).toBeInstanceOf(SerialMap);
		expect((rtnMap as any)[SerialSymbol.serializable]).toBeTruthy();
		expect(rtnMap.get('user_0')).toBeInstanceOf(User);
		expect(rtnMap.get('user_1')).toBeInstanceOf(User);
		expect(rtnMap.get('user_0')?.email).toBe(user0.email);
		expect(rtnMap.get('user_1')?.email).toBe(user1.email);
	});

	test('Check that map support', async () => {
		const rtnMap = await testWorker.getMap(toSerialObject(userMap0));
		expect(rtnMap).toBeInstanceOf(SerialMap);
		expect((rtnMap as any)[SerialSymbol.serializable]).toBeTruthy();
		expect(rtnMap.get('user_0')).toBeInstanceOf(User);
		expect(rtnMap.get('user_1')).toBeInstanceOf(User);
		expect(rtnMap.get('user_0')?.email).toBe(user0.email);
		expect(rtnMap.get('user_1')?.email).toBe(user1.email);
	});
});
