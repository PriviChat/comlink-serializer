import { expect, test } from '@jest/globals';
import { User } from '../../test/fixtures/User';
import { ObjectRegistry } from './ObjectRegistry';

describe('ObjectRegistry', () => {
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
});
