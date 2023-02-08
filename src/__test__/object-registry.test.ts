import { expect, test, jest } from '@jest/globals';
import User from '@test-fixtures/user';

import objectRegistry from '../registry';
import Order from '@test-fixtures/order';
import { UserClass } from '@test-fixtures/types';
import Product from '@test-fixtures/product';
import SerialSymbol from '../serial/serial-symbol';

describe('ObjectRegistry', () => {
	beforeAll(() => {
		Product;
		User;
		Order;
	});
	test('Check defined', () => {
		expect(objectRegistry).toBeDefined();
	});

	test('Check registered User', () => {
		const entry = objectRegistry.getEntryByToken(UserClass);
		expect(entry).toBeDefined();
		expect(entry?.classToken).toBe(UserClass);
		expect(entry?.constructor).toBeDefined();
	});

	test('Check registered SerialArray', () => {
		const entry = objectRegistry.getEntryByToken(SerialSymbol.serialArray);
		expect(entry).toBeDefined();
		expect(entry?.classToken).toBe(SerialSymbol.serialArray);
		expect(entry?.constructor).toBeDefined();
	});

	test('Check invalid object', () => {
		const entry = objectRegistry.getEntryByToken('1234');
		expect(entry).toBeUndefined();
	});

	test('Throws when registering class that is already registered', () => {
		expect(() => {
			objectRegistry.register({
				constructor: {} as any,
				class: 'User',
				classToken: UserClass,
			});
		}).toThrow();
	});

	test('Throws when entry class is empty', () => {
		expect(() => {
			objectRegistry.register({
				constructor: {} as any,
				class: '',
				classToken: '',
			});
		}).toThrow();
	});
});
