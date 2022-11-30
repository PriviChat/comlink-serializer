import { expect, test } from '@jest/globals';
import { SerializedUser } from '../../test/fixtures/types';
import { User } from '../../test/fixtures/User';
import { SerializableArray } from '../serialobjs';
import { SerializedArray } from '../serialobjs/types';
import { Deserializer } from './Deserializer';
import { Serializable } from './mixin';

let user0: SerializedUser;
let user1: SerializedUser;
let user2: SerializedUser;
let userArray: SerializedArray;

describe('Deserializer', () => {
	beforeEach(() => {
		SerializableArray;
		User;
		user0 = {
			_SCLASS: 'e45b5b10-1097-5d39-92d5-f66521e79e39', // User _SCLASS
			email: 'john.smith-0@email.com',
			firstName: 'John',
			lastName: 'Smith',
		};
		user1 = {
			_SCLASS: 'e45b5b10-1097-5d39-92d5-f66521e79e39', // User _SCLASS
			email: 'john.smith-1@email.com',
			firstName: 'John',
			lastName: 'Smith',
		};
		user2 = {
			_SCLASS: 'e45b5b10-1097-5d39-92d5-f66521e79e39', // User _SCLASS
			email: 'john.smith-2@email.com',
			firstName: 'John',
			lastName: 'Smith',
		};
		userArray = {
			_SCLASS: '0fc6729c-e75f-521f-8ad6-657a78494fd6', // SerializableArray _SCLASS
			_array: [user0, user1, user2],
		};
	});

	test('Flat Object Deserialize', () => {
		const su = new User('', '', '');

		const user = Deserializer.deserialize(user0) as User;
		user.serialize();
		expect((user as any).isSerializable).toBeTruthy();
		expect((user as any)._SCLASS).toBeDefined();
		expect(user.email).toEqual('john.smith-0@email.com');
		expect(user.firstName).toEqual('John');
		expect(user.lastName).toEqual('Smith');
	});

	test('Array Object Deserialize', () => {
		const f = new Foo('foo');
		const a = new SerializableArray();
		const users = Deserializer.deserialize(userArray) as SerializableArray<User>;
		// users.serialize();
		expect((users as any).isSerializable).toBeTruthy();
		expect((users as any)._SCLASS).toBeDefined();
		expect(users[0].email).toEqual('john.smith-0@email.com');
		expect(users[0].firstName).toEqual('John');
		expect(users[0].lastName).toEqual('Smith');
	});
});

class Foo {
	constructor(foo: string) {}
}
