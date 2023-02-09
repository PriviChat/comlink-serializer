import * as Comlink from 'comlink';
import { jest, expect, test } from '@jest/globals';
import WorkerFactory from '@test-fixtures/worker-factory';
import SerializableTestWorker from '@test-fixtures/serializable-test-worker';
import ProxyTestWorker from '@test-fixtures/proxy-test-worker';

import ComlinkSerializer, { toSerial, toSerialProxy, toSerialIterator } from '@comlink-serializer';

import { serializableTransferHandler } from '../serial/comlink';
import SerialSymbol from '../serial/serial-symbol';
import { makeArr, makeObj } from './fixtures';
import { SerialIterableProxy, SerialIteratorResult } from '../serial/iterable';

import User from '@test-fixtures/user';
import Order from '@test-fixtures/order';
import Address from '@test-fixtures/address';
import Product from '@test-fixtures/product';

import { getClassToken, getRevived, getSerializable } from '@test-fixtures/utils';
import { AddressClass, OrderClass, ProductClass, UserClass } from '@test-fixtures/types';
import IterableTestWorker from '@test-fixtures/iterable-test-worker';

type WorkerConstructor<T> = new (...input: any[]) => Promise<Comlink.Remote<T>>;
type WorkerFacade<T> = Comlink.Remote<WorkerConstructor<T>>;

ComlinkSerializer.registerTransferHandler({ transferClasses: [User, Order, Address, Product] });

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
		expect(handler.canHandle(new SerialIterableProxy(new Array<User>().entries()))).toBe(true);
		expect(handler.canHandle(new SerialIteratorResult(makeObj<User>('user', 0), false))).toBe(true);
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
			handler.deserialize({} as any);
		}).toThrow();
	});
});

describe('SerializableTransferHandler Serializable', () => {
	let worker: Worker;
	let testWorker: Comlink.Remote<SerializableTestWorker>;

	beforeAll(async () => {
		worker = WorkerFactory.getSerializableTestWorker();
		const comlinkWorker = Comlink.wrap(worker) as WorkerFacade<SerializableTestWorker>;
		testWorker = await new comlinkWorker();
	});

	afterAll(async () => {
		//await new Promise((r) => setTimeout(r, 2000));
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
		expect(rtnObj.getPriAddress()).toEqual(user.getPriAddress());
	});

	test('Check that Order can pass-through Comlink', async () => {
		const order = makeObj<Order>('order', 3);

		const rtnOrder = await testWorker.getOrder(order);
		expect(rtnOrder).toBeInstanceOf(Order);
		expect(getSerializable(rtnOrder)).toBeTruthy();
		expect(getRevived(rtnOrder)).toBeTruthy();
		expect(getClassToken(rtnOrder)).toBe(OrderClass);
		expect(rtnOrder.orderId).toBe(order.orderId);
		// you cannot currently pass a prox (user) back through comlink.
		expect(rtnOrder.userProxy).toBeUndefined();
		// cannot compare user because addresses are a proxy
		expect(rtnOrder.user).toBeInstanceOf(User);
		expect(getSerializable(rtnOrder.user)).toBeTruthy();
		expect(getRevived(rtnOrder.user)).toBeTruthy();
		expect(getClassToken(rtnOrder.user)).toBe(UserClass);
		expect(rtnOrder.user.email).toBe(order.user.email);
		expect(rtnOrder.user.firstName).toBe(order.user.firstName);
		expect(rtnOrder.user.lastName).toBe(order.user.lastName);
		expect(rtnOrder.user.totalOrders).toBe(order.user.totalOrders);
		expect(rtnOrder.products).toEqual(order.products);
	});

	test('Check for single instance of Address after Order pass-through Comlink', async () => {
		const order = makeObj<Order>('order', 0);
		const address = makeObj<Address>('addr', 1);
		order.setAddress(address);
		order.user.setPriAddress(address);

		const rtnObj = await testWorker.getOrder(order);
		expect(rtnObj).toBeInstanceOf(Order);
		expect(getSerializable(rtnObj)).toBeTruthy();
		expect(getRevived(rtnObj)).toBeTruthy();
		expect(getClassToken(rtnObj)).toBe(OrderClass);

		// address to match
		const matchAddr = rtnObj.getAddress();
		// make sure a single instance of address is revived
		expect(matchAddr).toBe(rtnObj.user.getPriAddress());
	});

	test('Return User.priAddress property from proxied User on Order', async () => {
		const order = makeObj<Order>('order', 3);

		const rtnObj = await testWorker.getOrderUserAddress(order);
		expect(rtnObj).toBeInstanceOf(Address);
		expect(getSerializable(rtnObj)).toBeTruthy();
		expect(getRevived(rtnObj)).toBeTruthy();
		expect(getClassToken(rtnObj)).toBe(AddressClass);
		expect(rtnObj).toEqual(order.user.getPriAddress());
	});

	test('Return User.priAddress property by calling User.getPrimaryAddress() from proxied User on Order', async () => {
		const order = makeObj<Order>('order', 3);

		const rtnObj = await testWorker.callOrderUserGetPrimaryAddress(order);
		expect(rtnObj).toBeInstanceOf(Address);
		expect(getSerializable(rtnObj)).toBeTruthy();
		expect(getRevived(rtnObj)).toBeTruthy();
		expect(getClassToken(rtnObj)).toBe(AddressClass);
		expect(rtnObj).toEqual(order.user.getPriAddress());
	});

	test('Return User.addresses which is a proxy on User, which is a proxy on Order', async () => {
		const order = makeObj<Order>('order', 3);

		const rtnArr = await testWorker.getOrderUserAddresses(order);
		expect(rtnArr).toBeInstanceOf(Array);
		expect(rtnArr).toEqual(order.user.addresses);
	});

	test('Callback to main User.totalOrders property from proxy User on Order', async () => {
		const order = makeObj<Order>('order', 1);
		order.userProxy.totalOrders = 6;

		expect(order.userProxy.totalOrders).toBe(6);
		await testWorker.setOrderUserTotalOrders(order, 50);
		// since a property set cannot be async in the worker thread
		// we need to await before validating the value has updated.
		await new Promise((r) => setTimeout(r, 1000));
		// the value should be updated by now?
		expect(order.userProxy.totalOrders).toBe(50);
	});

	test('Callback to main User.setTotalOrders() function from proxy User on Order', async () => {
		const order = makeObj<Order>('order', 3);
		order.user.totalOrders = 3;

		expect(order.userProxy.totalOrders).toBe(3);
		await testWorker.callOrderUserSetOrderTotal(order, 1000);
		expect(order.userProxy.totalOrders).toBe(1000);
	});
});

describe('SerializableTransferHandler toSerialIterator()', () => {
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

	test('Return a total of orders from Array<User> iterator', async () => {
		const userArr = makeArr<User>('user', 5);
		const totalOrders = userArr.reduce((accum, user) => {
			return accum + user.totalOrders;
		}, 0);
		const total = await testWorker.getTotalOrdersArray(toSerialIterator(userArr));
		expect(total).toBe(totalOrders);
	});

	test('Return a total of orders from Array<User> iterator break after first', async () => {
		const user0 = makeObj<User>('user', 0);
		user0.totalOrders = 5;
		const user1 = makeObj<User>('user', 1);
		user1.totalOrders = 10;

		const total = await testWorker.getTotalOrdersBreakAfterFirstArray(toSerialIterator([user0, user1]));
		expect(total).toBe(5);
	});

	test('Return a total of orders Map<number, User> iterator', async () => {
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

describe('SerializableTransferHandler toSerial()', () => {
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

	test('Check that Array<User> can pass-through Comlink verify direct index', async () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const userArr = new Array<User>(user0, user1);

		const rtnArr = await testWorker.getArray(toSerial(userArr));
		expect(rtnArr).toBeInstanceOf(Array);
		expect(rtnArr[0]).toBeInstanceOf(User);
		expect(getSerializable(rtnArr[0])).toBeTruthy();
		expect(getRevived(rtnArr[0])).toBeTruthy();
		expect(getClassToken(rtnArr[0])).toBe(UserClass);
		// you cannot currently pass a proxy (addresses) back through comlink.
		expect(rtnArr[0].addresses).toBeUndefined();
		expect(rtnArr[0].email).toBe(user0.email);
		expect(rtnArr[0].firstName).toBe(user0.firstName);
		expect(rtnArr[0].lastName).toBe(user0.lastName);
		expect(rtnArr[0].totalOrders).toBe(user0.totalOrders);
		expect(rtnArr[0].getPriAddress()).toEqual(user0.getPriAddress());
		// you cannot currently pass a proxy (addresses) back through comlink.
		expect(rtnArr[1].addresses).toBeUndefined();
		expect(rtnArr[1].email).toBe(user1.email);
		expect(rtnArr[1].firstName).toBe(user1.firstName);
		expect(rtnArr[1].lastName).toBe(user1.lastName);
		expect(rtnArr[1].totalOrders).toBe(user1.totalOrders);
		expect(rtnArr[1].getPriAddress()).toEqual(user1.getPriAddress());
	});

	test('Check that Array<User> can pass-through Comlink verify with for-loop', async () => {
		const userArr = makeArr<User>('user', 5);
		const rtnArr = await testWorker.getArray(toSerial(userArr));
		expect(rtnArr).toBeInstanceOf(Array);

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
		expect(rtnMap.get(0)).toBeInstanceOf(User);
		expect(rtnMap.get(1)).toBeInstanceOf(User);
		expect(rtnMap.get(0)?.email).toBe(user0.email);
		expect(rtnMap.get(1)?.email).toBe(user1.email);
	});
});

describe('SerializableTransferHandler toSerialProxy()', () => {
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

	test('Return street from Address proxy', async () => {
		const addr0 = makeObj<Address>('addr', 0);

		const rtnStreet = await testWorker.getAddressStreet(toSerialProxy(addr0));
		expect(rtnStreet).toBe(addr0.street);
	});

	test('Return product count from Order proxy', async () => {
		const order = makeObj<Order>('order', 10);

		const rtnArrProd = await testWorker.getOrderProducts(toSerialProxy(order));
		for (const prod of rtnArrProd) {
			expect(getSerializable(prod)).toBeTruthy();
			expect(getRevived(prod)).toBeTruthy();
			expect(getClassToken(prod)).toBe(ProductClass);
		}
		expect(rtnArrProd).toEqual(order.products);
	});

	test('Return addresses count from Order and User and Addresses proxy', async () => {
		const order = makeObj<Order>('order', 10);

		const rtnArrAddr = await testWorker.getOrderUserAddresses(toSerialProxy(order));
		for (const addr of rtnArrAddr) {
			expect(getSerializable(addr)).toBeTruthy();
			expect(getRevived(addr)).toBeTruthy();
			expect(getClassToken(addr)).toBe(AddressClass);
		}
		expect(rtnArrAddr).toEqual(order.user.addresses);
	});

	test('Return addresses count from Order and User and Addresses proxy', async () => {
		const order = makeObj<Order>('order', 10);

		const rtnArrAddr = await testWorker.getOrderUserAddresses(toSerialProxy(order));
		for (const addr of rtnArrAddr) {
			expect(getSerializable(addr)).toBeTruthy();
			expect(getRevived(addr)).toBeTruthy();
			expect(getClassToken(addr)).toBe(AddressClass);
		}
		expect(rtnArrAddr).toEqual(order.user.addresses);
	});
});
