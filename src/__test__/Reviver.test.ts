import { expect, test, jest } from '@jest/globals';
import User from '@test-fixtures/user';
import Product from '@test-fixtures/product';
import Order from '@test-fixtures/order';
import { ProductClass, SerializedUser, UserClass } from '@test-fixtures/types';
import { getClassToken, getRevived, getSerializable } from '@test-fixtures/utils';
import { Reviver, Serializer, SerialProxy } from '../serial';
import { makeArr, makeObj } from './fixtures';
import { makeSerial } from '../serial/utils';
import SerialSymbol from 'src/serial/serial-symbol';

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
		expect(getSerializable(user)).toBeTruthy();
		expect(getRevived(user)).toBeTruthy();
		expect(getClassToken(user)).toEqual(UserClass.toString());
		expect(user.email).toEqual(user0.email);
		expect(user.firstName).toEqual(user0.firstName);
		expect(user.lastName).toEqual(user0.lastName);
	});

	test('Flat object auto revive', () => {
		const prod0 = makeObj<Product>('prod', 0);

		const prod = reviver.revive<Product>(serializer.serialize(prod0));
		expect(getSerializable(prod)).toBeTruthy();
		expect(getRevived(prod)).toBeTruthy();
		expect(getClassToken(prod)).toEqual(ProductClass.toString());
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

		//user is a proxy...how will this get tested
		const user = order.user;
		expect(getSerializable(user)).toBeTruthy();
		expect(getClassToken(user)).toEqual(SerialSymbol.serialProxy.toString());
		expect(user.email).toEqual(user0.email);
		expect(user.firstName).toEqual(user0.firstName);
		expect(user.lastName).toEqual(user0.lastName);

		expect(order.products.length).toEqual(3);
		const products = order.products;

		const prodObj0 = products[0];
		expect(getSerializable(prodObj0)).toBeTruthy();
		expect(getRevived(prodObj0)).toBeTruthy();
		expect(getClassToken(prodObj0)).toEqual(ProductClass.toString());
		expect(prodObj0.productId).toEqual(prod0.productId);
		expect(prodObj0.productName).toEqual(prod0.productName);

		const prodObj1 = products[1];
		expect(getSerializable(prodObj1)).toBeTruthy();
		expect(getRevived(prodObj1)).toBeTruthy();
		expect(getClassToken(prodObj1)).toEqual(ProductClass.toString());
		expect(prodObj1.productId).toEqual(prod1.productId);
		expect(prodObj1.productName).toEqual(prod1.productName);

		const prodObj2 = products[2];
		expect(getSerializable(prodObj2)).toBeTruthy();
		expect(getRevived(prodObj2)).toBeTruthy();
		expect(getClassToken(prodObj2)).toEqual(ProductClass.toString());
		expect(prodObj2.productId).toEqual(prod2.productId);
		expect(prodObj2.productName).toEqual(prod2.productName);
	});

	test('Array revive', () => {
		const userArr = makeArr<User>('user', 4);

		const revArr = reviver.revive<User[]>(serializer.serialize(makeSerial(userArr)));

		let idx = 0;
		for (const user of revArr) {
			expect(getSerializable(user)).toBeTruthy();
			expect(getRevived(user)).toBeTruthy();
			expect(getClassToken(user)).toEqual(UserClass.toString());
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

		const revMap = reviver.revive<Map<string, User>>(serializer.serialize(makeSerial(userMap)));

		let idx = 0;
		for (const [key, user] of revMap) {
			expect(getSerializable(user)).toBeTruthy();
			expect(getRevived(user)).toBeTruthy();
			expect(getClassToken(user)).toEqual(UserClass.toString());
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

		const revMap = reviver.revive<Map<number, User>>(serializer.serialize(makeSerial(userMap)));

		let idx = 0;
		for (const [key, user] of revMap) {
			expect(getSerializable(user)).toBeTruthy();
			expect(getRevived(user)).toBeTruthy();
			expect(getClassToken(user)).toEqual(UserClass.toString());
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

		const revMap = reviver.revive<Map<boolean, User>>(serializer.serialize(makeSerial(userMap)));

		let idx = 0;
		for (const [key, user] of revMap) {
			expect(getSerializable(user)).toBeTruthy();
			expect(getRevived(user)).toBeTruthy();
			expect(getClassToken(user)).toEqual(UserClass.toString());
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
		const userSerial0 = serializer.serialize<SerializedUser>(user0);

		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		userSerial0['ComSer.serialized']!.classToken = '';
		expect(() => {
			reviver.revive(userSerial0);
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});

	test('Reviver error handling invalid class', () => {
		const user0 = makeObj<User>('user', 0);
		const userSerial0 = serializer.serialize<SerializedUser>(user0);
		userSerial0['ComSer.serialized']!.classToken = '123456';

		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => {
			reviver.revive(userSerial0);
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});

	test('Reviver error handling no hash', () => {
		const user0 = makeObj<User>('user', 0);
		const userSerial0 = serializer.serialize<SerializedUser>(user0);
		userSerial0['ComSer.serialized']!.hash = '';

		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => {
			reviver.revive(userSerial0);
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});
});
