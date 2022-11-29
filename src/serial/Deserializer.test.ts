import { expect, test } from '@jest/globals';
import { SerializedUser } from '../../test/fixtures/types';
import { User } from '../../test/fixtures/User';
import { SerializableArray } from '../serialobjs';
import { SerializedArray } from '../serialobjs/types';
import { Deserializer } from './Deserializer';

let user1: SerializedUser;
let user2: SerializedUser;
let user3: SerializedUser;
let userArray: SerializedArray;

describe('Deserializer', () => {
	beforeEach(() => {
		SerializableArray;
		User;
		user1 = {
			_SCLASS: 'e45b5b10-1097-5d39-92d5-f66521e79e39', // User _SCLASS
			email: 'john.smith1@email.com',
			firstName: 'John',
			lastName: 'Smith',
		};
		user2 = {
			_SCLASS: 'e45b5b10-1097-5d39-92d5-f66521e79e39', // User _SCLASS
			email: 'john.smith2@email.com',
			firstName: 'John',
			lastName: 'Smith',
		};
		user3 = {
			_SCLASS: 'e45b5b10-1097-5d39-92d5-f66521e79e39', // User _SCLASS
			email: 'john.smith3@email.com',
			firstName: 'John',
			lastName: 'Smith',
		};
		userArray = {
			_SCLASS: '0fc6729c-e75f-521f-8ad6-657a78494fd6', // SerializableArray _SCLASS
			_array: [user1, user2, user3],
		};
	});
	test('Flat Object Deserialize', () => {
		const user = Deserializer.deserialize(user1) as User;
		expect((user as any).isSerializable).toBeTruthy();
		expect((user as any)._SCLASS).toBeDefined();
		expect(user.email).toEqual('john.smith1@email.com');
		expect(user.firstName).toEqual('John');
		expect(user.lastName).toEqual('Smith');
	});

	test('Array Object Deserialize', () => {
		const array = Deserializer.deserialize(userArray) as SerializableArray<User>;
		// expect(user.email).toEqual('john.smith1@email.com');
		// expect(user.firstName).toEqual('John');
		// expect(user.lastName).toEqual('Smith');
	});
});
