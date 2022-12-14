import { expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import { SerializableArray, Serializable } from '@comlink-serializer';

describe('SerializableArray Tests', () => {
	test('Array implements isEmpty check', () => {
		const arr = new SerializableArray();
		const arr2 = new SerializableArray({} as Serializable);
		expect(typeof arr.isEmpty).toBe('function');
		expect(arr.isEmpty()).toBeTruthy();
		expect(arr2.isEmpty()).toBeFalsy();
	});

	test('Array serializes contents', () => {
		const user1 = new User('foo@example.org', 'Bob', 'Smith');
		const user2 = new User('foo2@example.org', 'Bob2', 'Smith2');

		const arr = new SerializableArray(user1, user2);

		const serializedArr = arr.serialize();

		expect(serializedArr.__$SCLASS).toBeDefined();
		expect(serializedArr._array[0].__$SCLASS).toBeDefined();
		expect(serializedArr._array[1].__$SCLASS).toBeDefined();
	});
});
