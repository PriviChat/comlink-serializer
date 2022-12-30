import { expect, test, jest } from '@jest/globals';
import User from '@test-fixtures/User';
import { objectRegistry } from '@comlink-serializer-internal';
import { SymRegIdMap } from '@test-fixtures/SymMap';

//type SerializeFn<T> = () => T;
//type DeserializeFn = (serialObj: Serialized) => Serializable<Serialized>;
//type ConstructorFn = AnyConstructor<Serializable<Serialized> & Deserializable>;

describe('ObjectRegistry', () => {
	beforeAll(() => {
		User;
	});
	test('Returns An Instance', () => {
		expect(objectRegistry).toBeDefined();
	});

	test('Check Registered Object', () => {
		const entry = objectRegistry.getEntry(SymRegIdMap.User);
		expect(entry).toBeDefined();
		expect(entry.name).toBe('User');
		expect(entry.constructor).toBeDefined();
	});

	test('Throws exception when entry does not exist for sclass', () => {
		expect(() => {
			objectRegistry.getEntry('foo');
		}).toThrow();
	});

	/* test('Throws exception when registering class without sclass', () => {
		const ctr = jest.fn<ConstructorFn>();
		expect(() => {
			_$.objectRegistry.register({
				$SCLASS: '',
				constructor: jest.mock<ConstructorFn>(),
				name: '',
			});
		}).toThrow();
	});

	test('Throws exception when registering class that is already registered', () => {
		expect(() => {
			_$.objectRegistry.register({
				$SCLASS: 'e45b5b10-1097-5d39-92d5-f66521e79e39', // user $SCLASS
				constructor: {},
				name: 'Mock',
			});
		}).toThrow();
	}); */
});
