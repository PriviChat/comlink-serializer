import { expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import { SerialArray, Serializable } from '@comlink-serializer';
import { SymRegIdMap, SymClassMap } from '@test-fixtures/SymMap';
import { SerializedUser } from '@test-fixtures/types';
import { getSerializableSymbol } from '@test-fixtures/utils';
import { SerialSymbol } from '@comlink-serializer-internal';

describe('SerialArray Tests', () => {
	test('Array implements isEmpty check', () => {
		const arr = new SerialArray();
		const arr2 = new SerialArray({} as Serializable);
		expect(typeof arr.isEmpty).toBe('function');
		expect(arr.isEmpty()).toBeTruthy();
		expect(arr2.isEmpty()).toBeFalsy();
	});

	test('Species constructor returns Array', () => {
		const arr = new SerialArray[Symbol.species]();
		expect(arr).toBeInstanceOf(Array);
		expect(arr).not.toBeInstanceOf(SerialArray);
	});

	test('Array serializes contents', () => {
		const user0 = new User('foo@example.org_0', 'Bob_0', 'Smith_0', 0);
		const user1 = new User('foo1@example.org_1', 'Bob_1', 'Smith_1', 1);

		const arr = new SerialArray<User>(user0, user1);
		const serializedArr = arr.serialize();

		const arrMeta = serializedArr[SerialSymbol.serializable]!();
		expect(arrMeta).toBeDefined();
		expect(arrMeta?.rid).toEqual(SymRegIdMap.SerialArray);
		expect(arrMeta?.cln).toEqual(SymClassMap.SerialArray);
		expect(arrMeta?.hsh).toBeDefined();

		const serUser0 = serializedArr._array[0] as SerializedUser;
		const serUser0Meta = serUser0[SerialSymbol.serializable]!();
		expect(serUser0Meta).toBeDefined();
		expect(serUser0Meta?.rid).toEqual(SymRegIdMap.User);
		expect(serUser0Meta?.cln).toEqual(SymClassMap.User);
		expect(serUser0Meta?.hsh).toBeDefined();
		expect(serUser0.email).toEqual(user0.email);
		expect(serUser0.firstName).toEqual(user0.firstName);
		expect(serUser0.lastName).toEqual(user0.lastName);
		expect(serUser0.totalOrders).toEqual(user0.totalOrders);

		const serUser1 = serializedArr._array[1] as SerializedUser;
		const serUser1Meta = serUser1[SerialSymbol.serializable]!();
		expect(serUser1Meta).toBeDefined();
		expect(serUser1Meta?.rid).toEqual(SymRegIdMap.User);
		expect(serUser1Meta?.cln).toEqual(SymClassMap.User);
		expect(serUser1Meta?.hsh).toBeDefined();
		expect(serUser1.email).toEqual(user1.email);
		expect(serUser1.firstName).toEqual(user1.firstName);
		expect(serUser1.lastName).toEqual(user1.lastName);
		expect(serUser1.totalOrders).toEqual(user1.totalOrders);
	});
});
