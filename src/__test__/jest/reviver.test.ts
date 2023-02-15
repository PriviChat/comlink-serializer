import { expect, test, jest } from '@jest/globals';
import User from '@test-fixtures/user';
import Product from '@test-fixtures/product';
import Order from '@test-fixtures/order';
import { CircleClass, ProductClass, UserClass } from '@test-fixtures/types';
import { getClassToken, getRevived, getSerializable } from '@test-fixtures/utils';
import { Reviver, Serializer } from '../../serial';
import { makeArr, makeObj } from '../fixtures';
import { makeSerial } from '../../serial/utils';
import Circle from '@test-fixtures/circle';

describe('Reviver', () => {
	let serializer: Serializer;
	let reviver: Reviver;

	beforeEach(() => {
		//must create a new reviver before each
		reviver = new Reviver();
		serializer = new Serializer();
	});

	afterEach(() => {
		// close the message ports
		serializer.destroy();
	});

	test('Revive Product', () => {
		const prod0 = makeObj<Product>('prod', 0);

		const rtnProd = reviver.revive<Product>(serializer.serialize(prod0));
		expect(getSerializable(rtnProd)).toBeTruthy();
		expect(getRevived(rtnProd)).toBeTruthy();
		expect(getClassToken(rtnProd)).toBe(ProductClass);
		expect(rtnProd.productId).toBe(prod0.productId);
		expect(rtnProd.productName).toBe(prod0.productName);
	});

	test('Revive User', () => {
		const user0 = makeObj<User>('user', 0);

		const rtnUser = reviver.revive<User>(serializer.serialize(user0));
		expect(getSerializable(rtnUser)).toBeTruthy();
		expect(getRevived(rtnUser)).toBeTruthy();
		expect(getClassToken(rtnUser)).toBe(UserClass);
		expect(rtnUser.email).toEqual(user0.email);
		expect(rtnUser.firstName).toBe(user0.firstName);
		expect(rtnUser.lastName).toBe(user0.lastName);

		expect(rtnUser.getPriAddress()).toEqual(user0.getPriAddress());
	});

	test('Revive circular relationship', () => {
		const circle = new Circle('Red');

		const rtnCircle = reviver.revive<Circle>(serializer.serialize(circle));
		expect(getSerializable(rtnCircle)).toBeTruthy();
		expect(getRevived(rtnCircle)).toBeTruthy();
		expect(getClassToken(rtnCircle)).toBe(CircleClass);
		expect(rtnCircle.color).toBe(circle.color);

		const rtnCirCircle = rtnCircle.circle;
		expect(getSerializable(rtnCirCircle)).toBeTruthy();
		expect(getRevived(rtnCirCircle)).toBeTruthy();
		expect(getClassToken(rtnCirCircle)).toEqual(CircleClass);
		expect(rtnCirCircle.color).toBe(circle.color);

		expect(rtnCirCircle).toEqual(rtnCircle);
	});

	test('Nested object with array revive', () => {
		const prod0 = makeObj<Product>('prod', 0);
		const prod1 = makeObj<Product>('prod', 1);
		const prod2 = makeObj<Product>('prod', 2);

		const order0 = makeObj<Order>('order', 3);

		const rtnOrder = reviver.revive<Order>(serializer.serialize(order0));
		expect(rtnOrder.orderId).toEqual(order0.orderId);

		//user is a proxy...how will this get tested
		expect(getSerializable(rtnOrder.user)).toBeTruthy();
		expect(getClassToken(rtnOrder.user)).toBe(UserClass);
		expect(rtnOrder.user.email).toBe(order0.user.email);
		expect(rtnOrder.user.firstName).toBe(order0.user.firstName);
		expect(rtnOrder.user.lastName).toBe(order0.user.lastName);

		expect(rtnOrder.productArr.length).toEqual(order0.productArr.length);
		const products = rtnOrder.productArr;

		const prodObj0 = products[0];
		expect(getSerializable(prodObj0)).toBeTruthy();
		expect(getRevived(prodObj0)).toBeTruthy();
		expect(getClassToken(prodObj0)).toBe(ProductClass);
		expect(prodObj0.productId).toBe(prod0.productId);
		expect(prodObj0.productName).toBe(prod0.productName);

		const prodObj1 = products[1];
		expect(getSerializable(prodObj1)).toBeTruthy();
		expect(getRevived(prodObj1)).toBeTruthy();
		expect(getClassToken(prodObj1)).toBe(ProductClass);
		expect(prodObj1.productId).toBe(prod1.productId);
		expect(prodObj1.productName).toBe(prod1.productName);

		const prodObj2 = products[2];
		expect(getSerializable(prodObj2)).toBeTruthy();
		expect(getRevived(prodObj2)).toBeTruthy();
		expect(getClassToken(prodObj2)).toBe(ProductClass);
		expect(prodObj2.productId).toBe(prod2.productId);
		expect(prodObj2.productName).toBe(prod2.productName);
	});

	test('Array revive', () => {
		const userArr = makeArr<User>('user', 4);

		const revArr = reviver.revive<User[]>(serializer.serialize(makeSerial(userArr)));

		let idx = 0;
		for (const user of revArr) {
			expect(getSerializable(user)).toBeTruthy();
			expect(getRevived(user)).toBeTruthy();
			expect(getClassToken(user)).toBe(UserClass);
			expect(user.email).toBe('bob@email.org_' + idx);
			expect(user.firstName).toBe('Bob_' + idx);
			expect(user.lastName).toBe('Smith_' + idx);
			expect(user.totalOrders).toBe(idx);
			idx += 1;
		}
		expect(revArr.length).toBe(userArr.length);
	});

	test('Set revive', () => {
		const userSet = new Set(makeArr<User>('user', 4));

		const revSet = reviver.revive<Set<User>>(serializer.serialize(makeSerial(userSet)));

		let idx = 0;
		for (const user of revSet) {
			expect(getSerializable(user)).toBeTruthy();
			expect(getRevived(user)).toBeTruthy();
			expect(getClassToken(user)).toBe(UserClass);
			expect(user.email).toBe('bob@email.org_' + idx);
			expect(user.firstName).toBe('Bob_' + idx);
			expect(user.lastName).toBe('Smith_' + idx);
			expect(user.totalOrders).toBe(idx);
			idx += 1;
		}
		expect(revSet.size).toBe(userSet.size);
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
			expect(getClassToken(user)).toBe(UserClass);
			expect(key).toBe(idx.toString());
			expect(user.email).toBe('bob@email.org_' + idx);
			expect(user.firstName).toBe('Bob_' + idx);
			expect(user.lastName).toBe('Smith_' + idx);
			expect(user.totalOrders).toBe(idx);
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
			expect(getClassToken(user)).toBe(UserClass);
			expect(key).toBe(idx);
			expect(user.email).toBe('bob@email.org_' + idx);
			expect(user.totalOrders).toBe(idx);
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
			expect(getClassToken(user)).toBe(UserClass);
			expect(key).toEqual(idx === 1);
			expect(user.email).toBe('bob@email.org_' + idx);
			expect(user.totalOrders).toBe(idx);
			idx += 1;
		}
		expect(revMap.size).toEqual(2);
	});

	test('Reviver error handling empty object', () => {
		const foo = {} as any;
		expect(() => {
			reviver.revive(foo);
		}).toThrow();
	});

	test('Reviver error handling no class', () => {
		const user0 = makeObj<User>('user', 0);
		const userSerial0 = serializer.serialize(user0);

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
		const userSerial0 = serializer.serialize(user0);
		userSerial0['ComSer.serialized']!.classToken = '123456';

		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => {
			reviver.revive(userSerial0);
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});
});
