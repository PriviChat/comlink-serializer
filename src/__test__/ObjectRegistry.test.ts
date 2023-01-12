import { expect, test, jest } from '@jest/globals';
import User from '@test-fixtures/User';

import objectRegistry from '../registry';
import Order from '@test-fixtures/Order';
import { SerialArray } from '../serialobjs';
import { UserClass } from '@test-fixtures/types';
import Product from '@test-fixtures/Product';

//type SerializeFn<T> = () => T;
//type DeserializeFn = (serialObj: Serialized) => Serializable<Serialized>;
//type ConstructorFn = AnyConstructor<Serializable<Serialized> & Deserializable>;

describe('ObjectRegistry', () => {
	beforeAll(() => {
		Product;
		User;
		Order;
		//SerialArray;
	});
	test('Check defined', () => {
		expect(objectRegistry).toBeDefined();
	});

	test('Check registered User', () => {
		const entry = objectRegistry.getEntry(UserClass);
		expect(entry).toBeDefined();
		expect(entry?.classToken).toBe(UserClass);
		expect(entry?.constructor).toBeDefined();
	});

	test('Check registered SerialArray', () => {
		const entry = objectRegistry.getEntry(SerialArray.classToken);
		expect(entry).toBeDefined();
		expect(entry?.classToken).toBe(SerialArray.classToken);
		expect(entry?.constructor).toBeDefined();
	});

	test('Check invalid object', () => {
		const entry = objectRegistry.getEntry('1234');
		expect(entry).toBeUndefined();
	});

	test('Throws when registering class that is already registered', () => {
		expect(() => {
			objectRegistry.register({
				constructor: {} as any,
				classToken: UserClass,
			});
		}).toThrow();
	});

	test('Throws when entry class is empty', () => {
		expect(() => {
			objectRegistry.register({
				constructor: {} as any,
				classToken: '',
			});
		}).toThrow();
	});
});
