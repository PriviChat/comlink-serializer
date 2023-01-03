import { expect, test, jest } from '@jest/globals';
import User from '@test-fixtures/User';
import { SymClassMap, SymRegIdMap } from '@test-fixtures/SymMap';

import objectRegistry from '../registry';

//type SerializeFn<T> = () => T;
//type DeserializeFn = (serialObj: Serialized) => Serializable<Serialized>;
//type ConstructorFn = AnyConstructor<Serializable<Serialized> & Deserializable>;

describe('ObjectRegistry', () => {
	beforeAll(() => {
		User;
	});
	test('Check defined', () => {
		expect(objectRegistry).toBeDefined();
	});

	test('Check registered object', () => {
		const entry = objectRegistry.getEntry(SymRegIdMap.User);
		expect(entry).toBeDefined();
		expect(entry?.name).toBe(SymClassMap.User);
		expect(entry?.constructor).toBeDefined();
	});

	test('Check invalid object', () => {
		const entry = objectRegistry.getEntry('1234');
		expect(entry).toBeUndefined();
	});

	test('Throws when registering class that is already registered', () => {
		expect(() => {
			objectRegistry.register({
				id: SymRegIdMap.User,
				constructor: {} as any,
				name: 'Mock',
			});
		}).toThrow();
	});
});
