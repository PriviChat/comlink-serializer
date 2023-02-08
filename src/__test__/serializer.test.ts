import { jest, expect, test } from '@jest/globals';
import {
	CircleClass,
	OrderClass,
	SerializedCircle,
	SerializedOrder,
	SerializedUser,
	UserClass,
} from '@test-fixtures/types';
import User from '@test-fixtures/user';
import { getSerializedMeta } from '@test-fixtures/utils';
import { SerializedArray, SerializedMap, Serializer } from '../serial';
import { makeArr, makeObj } from './fixtures';
import { isSerializedArray, isSerializedMap, isSerializedProxy, makeSerial } from '../serial/utils';
import Order from '@test-fixtures/order';
import Address from '@test-fixtures/address';
import Circle from '@test-fixtures/circle';

describe('Serializer', () => {
	let serializer: Serializer;

	beforeEach(() => {
		serializer = new Serializer();
	});

	test('Serialize user', () => {
		const user0 = makeObj<User>('user', 0);

		const rtnUser = serializer.serialize<SerializedUser>(user0);
		const meta = getSerializedMeta(rtnUser);
		expect(meta.classToken).toBe(UserClass.toString());
		expect(meta.hash).toBeDefined();
		expect(rtnUser.firstName).toBe(user0.firstName);
		expect(rtnUser.lastName).toBe(user0.lastName);
		expect(rtnUser.email).toBe(user0.email);
		expect(isSerializedProxy(rtnUser.addresses)).toBeTruthy();
		expect(serializer.transferable.length).toBe(1);
	});

	test('Serialize user array', () => {
		const userArr = makeArr<User>('user', 5);

		const rtnUserArr = serializer.serialize<SerializedArray>(makeSerial(userArr));
		const meta = getSerializedMeta(rtnUserArr);
		expect(meta.hash).toBeDefined();
		expect(isSerializedArray(rtnUserArr)).toBeTruthy();
		expect(rtnUserArr['ComSer.array'].length).toBe(userArr.length);

		let idx = 0;
		for (const val of rtnUserArr['ComSer.array']) {
			const rtnUser = val as SerializedUser;
			expect(rtnUser.firstName).toBe(userArr[idx].firstName);
			expect(rtnUser.lastName).toBe(userArr[idx].lastName);
			expect(rtnUser.email).toBe(userArr[idx].email);
			expect(isSerializedProxy(rtnUser.addresses)).toBeTruthy();
			idx += 1;
		}
		expect(serializer.transferable.length).toBe(userArr.length);
	});

	test('Serialize user map', () => {
		const userArr = makeArr<User>('user', 5);
		const userMap = new Map(userArr.map((val, idx) => [idx, val]));

		const rtnUserMap = serializer.serialize<SerializedMap>(makeSerial(userMap));
		const meta = getSerializedMeta(rtnUserMap);
		expect(meta.hash).toBeDefined();
		expect(isSerializedMap(rtnUserMap)).toBeTruthy();
		expect(rtnUserMap['ComSer.size']).toBe(userMap.size);
		expect(rtnUserMap['ComSer.keyType']).toBe('number');

		for (const [key, val] of rtnUserMap['ComSer.map']) {
			const idx = Number.parseInt(key);
			const rtnUser = val as SerializedUser;
			expect(rtnUser.firstName).toBe(userArr[idx].firstName);
			expect(rtnUser.lastName).toBe(userArr[idx].lastName);
			expect(rtnUser.email).toBe(userArr[idx].email);
			expect(isSerializedProxy(rtnUser.addresses)).toBeTruthy();
		}
		expect(serializer.transferable.length).toBe(userArr.length);
	});

	test('Serialize order check for single instance of address', () => {
		const order = makeObj<Order>('order', 0);
		const address = makeObj<Address>('addr', 1);
		order.setAddress(address);
		order.user.setPriAddress(address);

		const rtnOrder = serializer.serialize<SerializedOrder>(order);
		const meta = getSerializedMeta(rtnOrder);
		expect(meta.classToken).toBe(OrderClass.toString());
		expect(meta.hash).toBeDefined();

		// address to match
		const matchAddr = rtnOrder.address;
		// make sure a single instance of address is serialized
		expect(matchAddr).toBe(rtnOrder.user.priAddress);
	});

	test('Serialize circular relationship', () => {
		const circle = new Circle('Red');

		const rtnCircle = serializer.serialize<SerializedCircle>(circle);
		const meta0 = getSerializedMeta(rtnCircle);
		expect(meta0.classToken).toBe(CircleClass.toString());
		expect(meta0.hash).toBeDefined();

		const meta1 = getSerializedMeta(rtnCircle.circle);
		expect(meta1.classToken).toBe(CircleClass.toString());
		expect(meta1.hash).toBeDefined();

		expect(rtnCircle).toEqual(rtnCircle.circle);
		expect(rtnCircle).toEqual(rtnCircle.circle.circle);

		expect(rtnCircle.color).toBe(circle.color);
		expect(rtnCircle.circle.color).toBe(circle.color);
	});
});
