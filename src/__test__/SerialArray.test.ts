import { expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import { SerialArray, Serializable, _$ } from '@comlink-serializer';
import IdMap from '@test-fixtures/IdMap';

describe('SerialArray Tests', () => {
	test('Array implements isEmpty check', () => {
		const arr = new SerialArray();
		const arr2 = new SerialArray({} as Serializable);
		expect(typeof arr.isEmpty).toBe('function');
		expect(arr.isEmpty()).toBeTruthy();
		expect(arr2.isEmpty()).toBeFalsy();
	});

	/* test('Array serializes contents', () => {
		const user1 = new User('foo@example.org', 'Bob', 'Smith');
		const user2 = new User('foo2@example.org', 'Bob2', 'Smith2');

		const arr = new SerialArray(user1, user2);

		const serializedArr = arr.serialize();

		expect((serializedArr as any)[_$.SerialSymbol.registryId]).toBeDefined();
		expect((serializedArr as any)[_$.SerialSymbol.registryId]).toEqual(IdMap.SerialArray);
		expect((serializedArr._array[0] as any)[_$.SerialSymbol.registryId]).toBeDefined();
		expect((serializedArr._array[0] as any)[_$.SerialSymbol.registryId]).toEqual(IdMap.User);
		expect((serializedArr._array[1] as any)[_$.SerialSymbol.registryId]).toBeDefined();
		expect((serializedArr._array[1] as any)[_$.SerialSymbol.registryId]).toEqual(IdMap.User);
	}); */
});
