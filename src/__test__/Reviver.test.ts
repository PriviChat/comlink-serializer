import { expect, test, jest } from '@jest/globals';
import hash from 'object-hash';
import User from '@test-fixtures/User';
import { Reviver, toSerialObject } from '@comlink-serializer';
import Product from '@test-fixtures/Product';
import Order from '@test-fixtures/Order';
import { getSerializableSymbol } from '@test-fixtures/utils';

import { SerialSymbol } from '../serial';
import { SerialArray, SerialMap } from '../serialobjs';
import { ProductClass, UserClass } from '@test-fixtures/types';
import { makeArr, makeObj } from './fixtures';
import { isSerializableObject } from '../serial/decorators/utils';

describe('Reviver', () => {
	let reviver: Reviver;

	beforeEach(() => {
		//must create a new reviver before each
		reviver = new Reviver();
	});

	test('Flat object manual revive', () => {
		const user0 = makeObj<User>('user', 0);

		if (!isSerializableObject(user0)) {
			throw Error('Invalid test object');
		}

		const user = reviver.revive<User>(user0.serialize());
		expect(SerialSymbol.serializable in user).toBeTruthy();
		const meta = getSerializableSymbol(user);
		expect(meta).toBeDefined();
		expect(meta?.classToken).toEqual(UserClass.toString());
		expect(meta?.hash).toBeUndefined();
		expect(user.email).toEqual(user0.email);
		expect(user.firstName).toEqual(user0.firstName);
		expect(user.lastName).toEqual(user0.lastName);
	});

	test('Flat object auto revive', () => {
		const prod0 = makeObj<Product>('prod', 0);

		if (!isSerializableObject(prod0)) {
			throw Error('Invalid test object');
		}

		const prod = reviver.revive<Product>(prod0.serialize());
		expect(SerialSymbol.serializable in prod).toBeTruthy();
		const meta = getSerializableSymbol(prod);
		expect(meta?.classToken).toEqual(ProductClass.toString());
		expect(meta?.hash).toBeUndefined();
		expect(prod.productId).toEqual(prod0.productId);
		expect(prod.productName).toEqual(prod0.productName);
	});

	test('Nested object with array revive', () => {
		const user0 = makeObj<User>('user', 0);

		const prod0 = makeObj<Product>('prod', 0);
		const prod1 = makeObj<Product>('prod', 1);
		const prod2 = makeObj<Product>('prod', 2);

		const order0 = makeObj<Order>('order', 3);

		if (!isSerializableObject(order0)) {
			throw Error('Invalid test object');
		}

		const order = reviver.revive<Order>(order0.serialize());
		expect(order.orderId).toEqual(order0.orderId);

		const user = order.user;
		expect(SerialSymbol.serializable in user).toBeTruthy();
		const userMeta = getSerializableSymbol(user);
		expect(userMeta).toBeDefined();
		expect(userMeta?.classToken).toEqual(UserClass.toString());
		expect(userMeta?.hash).toBeUndefined();
		expect(user.email).toEqual(user0.email);
		expect(user.firstName).toEqual(user0.firstName);
		expect(user.lastName).toEqual(user0.lastName);

		expect(order.products.length).toEqual(3);
		const products = order.products;

		const prodObj0 = products[0];
		expect(SerialSymbol.serializable in prodObj0).toBeTruthy();
		const prod0Meta = getSerializableSymbol(prodObj0);
		expect(prod0Meta).toBeDefined();
		expect(prod0Meta?.classToken).toEqual(ProductClass.toString());
		expect(prod0Meta?.hash).toBeUndefined();
		expect(prodObj0.productId).toEqual(prod0.productId);
		expect(prodObj0.productName).toEqual(prod0.productName);

		const prodObj1 = products[1];
		expect(SerialSymbol.serializable in prodObj1).toBeTruthy();
		const prod1Meta = getSerializableSymbol(prodObj1);
		expect(prod1Meta).toBeDefined();
		expect(prod1Meta?.classToken).toEqual(ProductClass.toString());
		expect(prod1Meta?.hash).toBeUndefined();
		expect(prodObj1.productId).toEqual(prod1.productId);
		expect(prodObj1.productName).toEqual(prod1.productName);

		const prodObj2 = products[2];
		expect(SerialSymbol.serializable in prodObj2).toBeTruthy();
		const prod2Meta = getSerializableSymbol(prodObj2);
		expect(prod2Meta).toBeDefined();
		expect(prod2Meta?.classToken).toEqual(ProductClass.toString());
		expect(prod2Meta?.hash).toBeUndefined();
		expect(prodObj2.productId).toEqual(prod2.productId);
		expect(prodObj2.productName).toEqual(prod2.productName);
	});

	test('Array revive', () => {
		const userArr = makeArr<User>('user', 4);

		const arr = reviver.revive<SerialArray<User>>(toSerialObject(userArr).serialize());
		expect(SerialSymbol.serializable in arr).toBeTruthy();
		const meta = getSerializableSymbol(arr);
		expect(meta).toBeDefined();

		let idx = 0;
		for (const user of arr) {
			expect(SerialSymbol.serializable in user).toBeTruthy();
			const userMeta = getSerializableSymbol(user);
			expect(userMeta).toBeDefined();
			expect(userMeta?.classToken).toEqual(UserClass.toString());
			expect(userMeta?.hash).toBeUndefined();
			expect(user.email).toEqual('bob@email.org_' + idx);
			expect(user.firstName).toEqual('Bob_' + idx);
			expect(user.lastName).toEqual('Smith_' + idx);
			expect(user.totalOrders).toEqual(idx);
			idx += 1;
		}
		expect(arr.length).toEqual(userArr.length);
	});

	test('Map string keys revive', () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const user2 = makeObj<User>('user', 2);
		const userMap = new Map([
			['0', user0],
			['1', user1],
			['2', user2],
		]);

		const map = reviver.revive<SerialMap<string, User>>(toSerialObject(userMap).serialize());
		expect(SerialSymbol.serializable in map).toBeTruthy();
		const meta = getSerializableSymbol(map);
		expect(meta).toBeDefined();

		let idx = 0;
		for (const [key, user] of map) {
			expect(SerialSymbol.serializable in user).toBeTruthy();
			const userMeta = getSerializableSymbol(user);
			expect(userMeta).toBeDefined();
			expect(userMeta?.classToken).toEqual(UserClass.toString());
			expect(userMeta?.hash).toBeUndefined();
			expect(key).toEqual(idx.toString());
			expect(user.email).toEqual('bob@email.org_' + idx);
			expect(user.firstName).toEqual('Bob_' + idx);
			expect(user.lastName).toEqual('Smith_' + idx);
			expect(user.totalOrders).toEqual(idx);
			idx += 1;
		}
		expect(map.size).toEqual(userMap.size);
	});

	test('Map number keys revive', () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const user2 = makeObj<User>('user', 2);
		const userMap = new Map([
			[0, user0],
			[1, user1],
			[2, user2],
		]);

		const map = reviver.revive<SerialMap<number, User>>(toSerialObject(userMap).serialize());
		expect(SerialSymbol.serializable in map).toBeTruthy();
		const meta = getSerializableSymbol(map);
		expect(meta).toBeDefined();

		let idx = 0;
		for (const [key, user] of map) {
			expect(SerialSymbol.serializable in user).toBeTruthy();
			const userMeta = getSerializableSymbol(user);
			expect(userMeta).toBeDefined();
			expect(key).toEqual(idx);
			expect(user.email).toEqual('bob@email.org_' + idx);
			expect(user.totalOrders).toEqual(idx);
			idx += 1;
		}
		expect(map.size).toEqual(userMap.size);
	});

	test('Map boolean keys revive', () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const user2 = makeObj<User>('user', 2);
		const userMap = new Map([
			[false, user0],
			[true, user2],
			[true, user1],
		]);

		const map = reviver.revive<SerialMap<boolean, User>>(toSerialObject(userMap).serialize());
		expect(SerialSymbol.serializable in map).toBeTruthy();
		const meta = getSerializableSymbol(map);
		expect(meta).toBeDefined();

		let idx = 0;
		for (const [key, user] of map) {
			expect(SerialSymbol.serializable in user).toBeTruthy();
			const userMeta = getSerializableSymbol(user);
			expect(userMeta).toBeDefined();
			expect(key).toEqual(idx === 1);
			expect(user.email).toEqual('bob@email.org_' + idx);
			expect(user.totalOrders).toEqual(idx);
			idx += 1;
		}
		expect(map.size).toEqual(2);
	});

	test('Reviver error handling empty object', () => {
		const foo = {};
		expect(() => {
			reviver.revive(foo);
		}).toThrow();
	});

	test('Reviver error handling no class', () => {
		const user0 = makeObj<User>('user', 0);

		if (!isSerializableObject(user0)) {
			throw Error('Invalid test object');
		}

		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		(user0 as any)[SerialSymbol.serializable] = () => {
			return {
				cln: '',
				hsh: hash(user0),
			};
		};
		expect(() => {
			reviver.revive(user0.serialize());
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});

	test('Reviver error handling invalid class', () => {
		const user0 = makeObj<User>('user', 0);

		if (!isSerializableObject(user0)) {
			throw Error('Invalid test object');
		}

		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		(user0 as any)[SerialSymbol.serializable] = () => {
			return {
				cln: '34353544',
				hsh: hash(user0),
			};
		};
		expect(() => {
			reviver.revive(user0.serialize());
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});

	//This needs to be a mock

	/* 	test('Reviver error handling no hash', () => {
		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		(user0 as any)[SerialSymbol.serializable] = () => {
			return {
				cln: UserClass,
				hsh: '',
			};
		};
		expect(() => {
			reviver.revive(user0.serialize());
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	}); */
});
