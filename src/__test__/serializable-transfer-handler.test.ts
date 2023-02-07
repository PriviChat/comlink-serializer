import * as Comlink from 'comlink';
import { jest, expect, test } from '@jest/globals';
import WorkerFactory from '@test-fixtures/worker-factory';
import SerializableTestWorker from '@test-fixtures/serializable-test-worker';
import ProxyTestWorker from '@test-fixtures/proxy-test-worker';

import ComlinkSerializer, {
	Serialized,
	Serializable,
	toSerial,
	toSerialProxy,
	toSerialIterator,
} from '@comlink-serializer';

import { serializableTransferHandler } from '../serial/comlink';
import SerialSymbol from '../serial/serial-symbol';
import { makeArr, makeObj } from './fixtures';
import { SerialArray, SerialMap } from '../serial';

import User from '@test-fixtures/user';
import Order from '@test-fixtures/order';
import Address from '@test-fixtures/address';

import { getClassToken, getRevived, getSerializable } from '@test-fixtures/utils';
import { AddressClass, OrderClass, UserClass } from '@test-fixtures/types';
import IterableTestWorker from '@test-fixtures/iterable-test-worker';

type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;

ComlinkSerializer.registerTransferHandler({ transferClasses: [User, Order] });

type SerializeFn<T> = () => T;
type DeserializeFn<T extends Serializable> = (serialObj: Serialized) => T;

describe('SerializableTransferHandler tests', () => {
	test('canHandle checks', () => {
		const handler = serializableTransferHandler.handler;
		expect(handler.canHandle(undefined)).toBe(false);
		expect(handler.canHandle(null)).toBe(false);
		expect(handler.canHandle({})).toBe(false);
		expect(handler.canHandle({ [SerialSymbol.serializable]: false })).toBe(false);
		expect(handler.canHandle({ [SerialSymbol.serializable]: true })).toBe(false);
		expect(handler.canHandle({ [SerialSymbol.toSerial]: true })).toBe(true);
		expect(handler.canHandle({ [SerialSymbol.toSerialProxy]: true })).toBe(true);
	});

	test('serializer throws exception when object is not valid', () => {
		const handler = serializableTransferHandler.handler;
		expect(() => {
			handler.serialize({} as any);
		}).toThrow();
	});

	test('deserialize throws exception when object is not valid', () => {
		const handler = serializableTransferHandler.handler;
		expect(() => {
			handler.deserialize({});
		}).toThrow();
	});
});

describe('SerializableTransferHandler Serializable Comlink pass-through', () => {
	let worker: Worker;
	let testWorker: Comlink.Remote<SerializableTestWorker>;

	beforeAll(async () => {
		worker = WorkerFactory.getSerializableTestWorker();
		const comlinkWorker = Comlink.wrap(worker) as WorkerFacade<SerializableTestWorker>;
		testWorker = await new comlinkWorker();
	});

	afterAll(() => {
		worker.terminate();
	});

	test('Check that User can pass-through Comlink', async () => {
		const user = makeObj<User>('user', 5);

		const rtnObj = await testWorker.getUser(user);
		expect(rtnObj).toBeInstanceOf(User);
		expect(getSerializable(rtnObj)).toBeTruthy();
		expect(getRevived(rtnObj)).toBeTruthy();
		expect(getClassToken(rtnObj)).toBe(UserClass);
		// you cannot currently pass a proxy (addresses) back through comlink.
		expect(rtnObj.addresses).toBeUndefined();
		expect(rtnObj.email).toBe(user.email);
		expect(rtnObj.firstName).toBe(user.firstName);
		expect(rtnObj.lastName).toBe(user.lastName);
		expect(rtnObj.totalOrders).toBe(user.totalOrders);
		expect(rtnObj.priAddress).toEqual(user.priAddress);
	});

	test('Check that Order can pass-through Comlink', async () => {
		const order = makeObj<Order>('order', 3);

		const rtnObj = await testWorker.getOrder(order);
		expect(rtnObj).toBeInstanceOf(Order);
		expect(getSerializable(rtnObj)).toBeTruthy();
		expect(getRevived(rtnObj)).toBeTruthy();
		expect(getClassToken(rtnObj)).toBe(OrderClass);
		expect(rtnObj.orderId).toBe(order.orderId);
		// you cannot currently pass a prox (user) back through comlink.
		expect(rtnObj.user).toBeUndefined();
		expect(rtnObj.products).toEqual(order.products);
	});

	test('Return User.priAddress property from proxied User on Order', async () => {
		const order = makeObj<Order>('order', 3);

		const rtnObj = await testWorker.getOrderUserAddress(order);
		expect(rtnObj).toBeInstanceOf(Address);
		expect(getSerializable(rtnObj)).toBeTruthy();
		expect(getRevived(rtnObj)).toBeTruthy();
		expect(getClassToken(rtnObj)).toBe(AddressClass);
		expect(rtnObj).toEqual(order.user.priAddress);
	});

	test('Return User.priAddress property by calling User.getPrimaryAddress() from proxied User on Order', async () => {
		const order = makeObj<Order>('order', 3);

		const rtnObj = await testWorker.callOrderUserGetPrimaryAddress(order);
		expect(rtnObj).toBeInstanceOf(Address);
		expect(getSerializable(rtnObj)).toBeTruthy();
		expect(getRevived(rtnObj)).toBeTruthy();
		expect(getClassToken(rtnObj)).toBe(AddressClass);
		expect(rtnObj).toEqual(order.user.getPrimaryAddress());
	});

	test('Return User.addresses which is proxied from User which is proxied on Order', async () => {
		const order = makeObj<Order>('order', 3);

		const rtnArr = await testWorker.getOrderUserAddresses(order);
		expect(rtnArr).toBeInstanceOf(Array);
		expect(rtnArr).toEqual(order.user.addresses);
	}, 1000000);

	test('Callback to main User.totalOrders property from proxied User on Order', async () => {
		const order = makeObj<Order>('order', 1);
		order.user.totalOrders = 6;

		expect(order.user.totalOrders).toBe(6);
		await testWorker.setOrderUserTotalOrders(order, 50);
		// since a property set cannot be async in the worker thread
		// we need to await before validating the value has updated.
		await new Promise((r) => setTimeout(r, 1000));
		// the value should be updated by now?
		expect(order.user.totalOrders).toBe(50);
	});

	test('Callback to main User.setTotalOrders() function from proxied User on Order', async () => {
		const order = makeObj<Order>('order', 3);
		order.user.totalOrders = 3;

		expect(order.user.totalOrders).toBe(3);
		await testWorker.callOrderUserSetOrderTotal(order, 1000);
		expect(order.user.totalOrders).toBe(1000);
	});
});

describe('SerializableTransferHandler Iterable Comlink pass-through', () => {
	let worker: Worker;
	let testWorker: Comlink.Remote<IterableTestWorker>;

	beforeAll(async () => {
		worker = WorkerFactory.getIterableTestWorker();
		const comlinkWorker = Comlink.wrap(worker) as WorkerFacade<IterableTestWorker>;
		testWorker = await new comlinkWorker();
	});

	afterAll(() => {
		worker.terminate();
	});

	test('Array get total user orders', async () => {
		const userArr = makeArr<User>('user', 5);
		const totalOrders = userArr.reduce((accum, user) => {
			return accum + user.totalOrders;
		}, 0);
		const total = await testWorker.getTotalOrdersArray(toSerialIterator(userArr));
		expect(total).toBe(totalOrders);
	});

	test('Array get total user orders break after first', async () => {
		const user0 = makeObj<User>('user', 0);
		user0.totalOrders = 5;
		const user1 = makeObj<User>('user', 1);
		user1.totalOrders = 10;

		const total = await testWorker.getTotalOrdersBreakAfterFirstArray(toSerialIterator([user0, user1]));
		expect(total).toBe(5);
	});

	test('Map get total user orders', async () => {
		const user0 = makeObj<User>('user', 0);
		user0.totalOrders = 2;

		const user1 = makeObj<User>('user', 1);
		user1.totalOrders = 4;

		const user2 = makeObj<User>('user', 2);
		user2.totalOrders = 6;

		const userMap = new Map([
			[0, user0],
			[1, user1],
			[2, user2],
		]);
		const total = await testWorker.getTotalOrdersMap(toSerialIterator(userMap));
		if (total === -1) throw Error('Issue with map index type!');
		expect(total).toBe(12);
	});
});

/* describe('SerializableTransferHandler toSerial Comlink pass-through', () => {
	let worker: Worker;
	let testWorker: Comlink.Remote<SerializableTestWorker>;

	beforeAll(async () => {
		worker = WorkerFactory.getSerializableTestWorker();
		const comlinkWorker = Comlink.wrap(worker) as WorkerFacade<SerializableTestWorker>;
		testWorker = await new comlinkWorker();
	});

	afterAll(() => {
		worker.terminate();
	});

	test('Check that User array can pass through Comlink (index)', async () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const userArr = new Array<User>(user0, user1);

		const rtnArr = await testWorker.getArray(toSerial(userArr));
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
		const rtnArr = await testWorker.getArray(toSerial(userArr));
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

		const rtnMap = await testWorker.getMap(toSerial(userMap));
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

		const rtnMap = await testWorker.getMap(toSerial(userMap));
		expect(rtnMap).toBeInstanceOf(SerialMap);
		expect((rtnMap as any)[SerialSymbol.serializable]).toBeTruthy();
		expect(rtnMap.get(0)).toBeInstanceOf(User);
		expect(rtnMap.get(1)).toBeInstanceOf(User);
		expect(rtnMap.get(0)?.email).toBe(user0.email);
		expect(rtnMap.get(1)?.email).toBe(user1.email);
	});
});

describe('SerializableTransferHandler toSerialProxy Comlink pass-through', () => {

	let worker: Worker;
	let testWorker: Comlink.Remote<ProxyTestWorker>;

	beforeAll(async () => {
		worker = WorkerFactory.getProxyTestWorker();
		const comlinkWorker = Comlink.wrap(worker) as WorkerFacade<ProxyTestWorker>;
		testWorker = await new comlinkWorker();
	});

	afterAll(() => {
		worker.terminate();
	});

	test('Check that Order object can pass through Comlink', async () => {
		const user0 = makeObj<User>('user', 0);
		const order = makeObj<Order>('order', 0);

		const rtnUser = await testWorker.getOrderUser(toSerialProxy(order));
		expect(rtnUser).toBeInstanceOf(User);
		expect((rtnUser as any)[SerialSymbol.serializable]).toBeTruthy();
		expect(rtnUser.email).toBe(user0.email);
		expect(rtnUser.firstName).toBe(user0.firstName);
		expect(rtnUser.lastName).toBe(user0.lastName);
		expect(rtnUser.totalOrders).toBe(user0.totalOrders);
	}, 10000000);

	test('Check that User array can pass through Comlink (index)', async () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const userArr = new Array<User>(user0, user1);

		const rtnArr = await testWorker.getArray(toSerial(userArr));
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
		const userArr = makeArr<User>('user', 2);
		const rtnArr = await testWorker.getArray(toSerial(userArr));
		expect(rtnArr).toBeInstanceOf(SerialArray);
		expect((rtnArr as any)[SerialSymbol.serializable]).toBeTruthy();

		let idx = 0;
		for (const user of rtnArr) {
			expect(user).toBeInstanceOf(User);
			expect(user.email).toBe('bob@email.org_' + idx);
			expect(user.firstName).toBe('Bob_' + idx);
			expect(user.lastName).toBe('Smith_' + idx);
			expect(user.totalOrders).toBe(idx);
			idx++;
		}
	});

	test('Check that User map can pass through Comlink', async () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const userMap = new Map([
			['0', user0],
			['1', user1],
		]);
		const rtnMap = await testWorker.getMap(toSerial(userMap));
		expect(rtnMap).toBeInstanceOf(SerialMap);
		expect((rtnMap as any)[SerialSymbol.serializable]).toBeTruthy();
		expect(rtnMap.get('0')).toBeInstanceOf(User);
		expect(rtnMap.get('1')).toBeInstanceOf(User);
		expect(rtnMap.get('0')?.email).toBe(user0.email);
		expect(rtnMap.get('1')?.email).toBe(user1.email);
	});
}); */
