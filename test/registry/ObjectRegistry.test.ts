import { expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import { _$ } from '@comlink-serializer';

let user;

describe('ObjectRegistry', () => {
	beforeAll(() => {
		user = new User('1234', 'John', 'Smith');
	});
	test('Returns An Instance', () => {
		expect(_$.objectRegistry).toBeDefined();
	});

	test('Check Registered Object', () => {
		const entry = _$.objectRegistry.getEntry('e45b5b10-1097-5d39-92d5-f66521e79e39'); // user $SCLASS
		expect(entry).toBeDefined();
		expect(entry.name).toBe('User');
		expect(entry.deserialize).toBeDefined();
	});

	test('Throws exception when entry does not exist for sclass', () => {
		expect(() => {
			_$.objectRegistry.getEntry('foo');
		}).toThrow();
	});

	test('Throws exception when registering class without sclass', () => {
		expect(() => {
			_$.objectRegistry.register({
				$SCLASS: '',
				deserialize: jest.fn(),
				name: '',
			});
		}).toThrow();
	});

	test('Throws exception when registering class that is already registered', () => {
		expect(() => {
			_$.objectRegistry.register({
				$SCLASS: 'e45b5b10-1097-5d39-92d5-f66521e79e39', // user $SCLASS
				deserialize: jest.fn(),
				name: 'Mock',
			});
		}).toThrow();
	});
});
