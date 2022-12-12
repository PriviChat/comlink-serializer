import { expect, test } from '@jest/globals';
import { User } from '..';
import { ObjectRegistry } from '@internal/registry/ObjectRegistry';

describe('ObjectRegistry', () => {
	beforeAll(() => {
		User;
	});
	test('Returns An Instance', () => {
		expect(ObjectRegistry.get()).toBeDefined();
	});

	test('Check Registered Object', () => {
		const reg = ObjectRegistry.get();
		const entry = reg.getEntry('e45b5b10-1097-5d39-92d5-f66521e79e39'); // user _SCLASS
		expect(entry).toBeDefined();
		expect(entry.name).toBe('User');
		expect(entry.deserialize).toBeDefined();
	});

	test('Throws exception when entry does not exist for sclass', () => {
		const reg = ObjectRegistry.get();
		expect(() => {
			reg.getEntry('foo');
		}).toThrow();
	});

	test('Throws exception when registering class without sclass', () => {
		const reg = ObjectRegistry.get();
		expect(() => {
			reg.register({
				$SCLASS: '',
				deserialize: jest.fn(),
				name: '',
			});
		}).toThrow();
	});

	test('Throws exception when registering class that is already registered', () => {
		const reg = ObjectRegistry.get();
		expect(() => {
			reg.register({
				$SCLASS: 'e45b5b10-1097-5d39-92d5-f66521e79e39', // user _SCLASS
				deserialize: jest.fn(),
				name: '',
			});
		}).toThrow();
	});
});
