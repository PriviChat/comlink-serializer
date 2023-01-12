import { expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import { Serializable, toSerialObject } from '@comlink-serializer';
import { SerializedUser, UserClass } from '@test-fixtures/types';

import { SerialSymbol } from '../serial';
import { SerialArray } from '../serialobjs';
import { makeObj } from './fixtures';

describe('SerialArray Tests', () => {
	test('Array implements isEmpty check', () => {
		const arr = toSerialObject(new Array());
		const arr2 = toSerialObject(new Array({} as Serializable));
		expect(typeof arr.isEmpty).toBe('function');
		expect(arr.isEmpty()).toBeTruthy();
		expect(arr2.isEmpty()).toBeFalsy();
	});

	test('Array isArray check', () => {
		const arr = toSerialObject(new Array());
		expect(Array.isArray(arr)).toBeTruthy();
	});

	test('Array instanceOf check', () => {
		const arr = toSerialObject(new Array());
		expect(arr).toBeInstanceOf(Array);
	});

	test('Array serializes contents', () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const userArr0 = toSerialObject([user0, user1]);
		const serializedArr = userArr0.serialize();

		const arrMeta = serializedArr[SerialSymbol.serialized];
		expect(arrMeta).toBeDefined();
		expect(arrMeta?.classToken).toEqual(SerialArray.classToken.toString());
		expect(arrMeta?.hash).toBeDefined();

		const serUser0 = serializedArr.$array[0] as SerializedUser;
		const serUser0Meta = serUser0[SerialSymbol.serialized];
		expect(serUser0Meta).toBeDefined();
		expect(serUser0Meta?.classToken).toEqual(UserClass.toString());
		expect(serUser0Meta?.hash).toBeDefined();
		expect(serUser0.email).toEqual(user0.email);
		expect(serUser0.firstName).toEqual(user0.firstName);
		expect(serUser0.lastName).toEqual(user0.lastName);
		expect(serUser0.totalOrders).toEqual(user0.totalOrders);

		const serUser1 = serializedArr.$array[1] as SerializedUser;
		const serUser1Meta = serUser1[SerialSymbol.serialized];
		expect(serUser1Meta).toBeDefined();
		expect(serUser1Meta?.classToken).toEqual(UserClass.toString());
		expect(serUser1Meta?.hash).toBeDefined();
		expect(serUser1.email).toEqual(user1.email);
		expect(serUser1.firstName).toEqual(user1.firstName);
		expect(serUser1.lastName).toEqual(user1.lastName);
		expect(serUser1.totalOrders).toEqual(user1.totalOrders);
	});
});
