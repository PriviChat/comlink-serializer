import { expect, test, jest } from '@jest/globals';
import hash from 'object-hash';
import User from '@test-fixtures/user';
import Product from '@test-fixtures/product';
import Order from '@test-fixtures/order';
import { getSerializableSymbol } from '@test-fixtures/utils';

import SerialSymbol from '../serial/serial-symbol';
import { Reviver, SerialArray, Serializer, SerialMap } from '../serial';
import { ProductClass, UserClass } from '@test-fixtures/types';
import { makeArr, makeObj } from './fixtures';
import { toSerializable } from '../serial/utils';

describe('Reviver', () => {
	let serializer: Serializer;
	let reviver: Reviver;

	beforeEach(() => {
		//must create a new reviver before each
		reviver = new Reviver();
		serializer = new Serializer();
	});

	test('Flat object manual revive', async () => {
		const user0 = makeObj<User>('user', 0);

		const user = reviver.revive<User>(serializer.serialize(user0));
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

		const prod = reviver.revive<Product>(serializer.serialize(prod0));
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

		const order = reviver.revive<Order>(serializer.serialize(order0));
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

		const revArr = reviver.revive<User[]>(serializer.serialize(toSerializable(userArr)));

		let idx = 0;
		for (const user of revArr) {
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
		expect(revArr.length).toEqual(userArr.length);
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

		const revMap = reviver.revive<Map<string, User>>(serializer.serialize(toSerializable(userMap)));

		let idx = 0;
		for (const [key, user] of revMap) {
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
		expect(revMap.size).toEqual(userMap.size);
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

		const revMap = reviver.revive<Map<number, User>>(serializer.serialize(toSerializable(userMap)));

		let idx = 0;
		for (const [key, user] of revMap) {
			expect(SerialSymbol.serializable in user).toBeTruthy();
			const userMeta = getSerializableSymbol(user);
			expect(userMeta).toBeDefined();
			expect(key).toEqual(idx);
			expect(user.email).toEqual('bob@email.org_' + idx);
			expect(user.totalOrders).toEqual(idx);
			idx += 1;
		}
		expect(revMap.size).toEqual(userMap.size);
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

		const revMap = reviver.revive<Map<boolean, User>>(serializer.serialize(toSerializable(userMap)));

		let idx = 0;
		for (const [key, user] of revMap) {
			expect(SerialSymbol.serializable in user).toBeTruthy();
			const userMeta = getSerializableSymbol(user);
			expect(userMeta).toBeDefined();
			expect(key).toEqual(idx === 1);
			expect(user.email).toEqual('bob@email.org_' + idx);
			expect(user.totalOrders).toEqual(idx);
			idx += 1;
		}
		expect(revMap.size).toEqual(2);
	});

	test('Reviver error handling empty object', () => {
		const foo = {};
		expect(() => {
			reviver.revive(foo);
		}).toThrow();
	});

	test('Reviver error handling no class', () => {
		const user0 = makeObj<User>('user', 0);

		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		(user0 as any)[SerialSymbol.serializable] = () => {
			return {
				cln: '',
				hsh: hash(user0),
			};
		};
		expect(() => {
			reviver.revive(serializer.serialize(user0));
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});

	test('Reviver error handling invalid class', () => {
		const user0 = makeObj<User>('user', 0);

		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		(user0 as any)[SerialSymbol.serializable] = () => {
			return {
				cln: '34353544',
				hsh: hash(user0),
			};
		};
		expect(() => {
			reviver.revive(serializer.serialize(user0));
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});

	test('Reviver error handling no hash', () => {
		const user0 = makeObj<User>('user', 0);

		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		(user0 as any)[SerialSymbol.serializable] = () => {
			return {
				cln: UserClass,
				hsh: '',
			};
		};
		expect(() => {
			reviver.revive(serializer.serialize(user0));
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});
});
