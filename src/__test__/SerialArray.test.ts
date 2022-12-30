import { expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import { SerialArray, Serializable } from '@comlink-serializer';
import { SymRegIdMap, SymClassMap } from '@test-fixtures/SymMap';
import { SerializedUser } from '@test-fixtures/types';

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

		expect(serializedArr['ComSer.registryId']).toEqual(SymRegIdMap.SerialArray);
		expect(serializedArr['ComSer.class']).toEqual(SymClassMap.SerialArray);

		const serialUser0 = serializedArr._array[0] as SerializedUser;
		expect(serialUser0['ComSer.registryId']).toEqual(SymRegIdMap.User);
		expect(serialUser0['ComSer.class']).toEqual(SymClassMap.User);
		expect(serialUser0.email).toEqual(user0.email);
		expect(serialUser0.firstName).toEqual(user0.firstName);
		expect(serialUser0.lastName).toEqual(user0.lastName);
		expect(serialUser0.totalOrders).toEqual(user0.totalOrders);

		const serialUser1 = serializedArr._array[1] as SerializedUser;
		expect(serialUser1['ComSer.registryId']).toEqual(SymRegIdMap.User);
		expect(serialUser1['ComSer.class']).toEqual(SymClassMap.User);
		expect(serialUser1.email).toEqual(user1.email);
		expect(serialUser1.firstName).toEqual(user1.firstName);
		expect(serialUser1.lastName).toEqual(user1.lastName);
		expect(serialUser1.totalOrders).toEqual(user1.totalOrders);
	});
});
