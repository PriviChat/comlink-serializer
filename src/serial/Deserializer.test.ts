import { expect, test } from '@jest/globals';
import { SerializedUser } from '../../test/fixtures/types';
import { User } from '../../test/fixtures/User';
import { SerializableArray, SerializableMap } from '../serialobjs';
import { SerializedArray, SerializedMap } from '../serialobjs/types';
import { Deserializer } from './Deserializer';

let user0: SerializedUser;
let user1: SerializedUser;
let user2: SerializedUser;
let userArray: SerializedArray;
let userMap: SerializedMap;
let userMap2: SerializedMap;

describe('Deserializer', () => {
	beforeEach(() => {
		SerializableArray;
		User;
		user0 = {
			$SCLASS: 'e45b5b10-1097-5d39-92d5-f66521e79e39', // User $SCLASS
			email: 'john.smith-0@email.com',
			firstName: 'John',
			lastName: 'Smith',
		};
		user1 = {
			$SCLASS: 'e45b5b10-1097-5d39-92d5-f66521e79e39', // User $SCLASS
			email: 'john.smith-1@email.com',
			firstName: 'John',
			lastName: 'Smith',
		};
		user2 = {
			$SCLASS: 'e45b5b10-1097-5d39-92d5-f66521e79e39', // User $SCLASS
			email: 'john.smith-2@email.com',
			firstName: 'John',
			lastName: 'Smith',
		};
		userArray = {
			$SCLASS: '0fc6729c-e75f-521f-8ad6-657a78494fd6', // SerializableArray $SCLASS
			_array: [user0, user1, user2],
		};
		userMap = {
			$SCLASS: 'a2341794-4348-5080-a350-624f81126bf6', // SerializableMap $SCLASS
			_map: new Map([
				['0', user0],
				['1', user1],
				['2', user2],
			]),
		};
	});

	test('Flat Object Deserialize', () => {
		const user = Deserializer.deserialize(user0) as User;
		expect((user as any).isSerializable).toBeTruthy();
		expect((user as any).$SCLASS).toBeDefined();
		expect(user.email).toEqual('john.smith-0@email.com');
		expect(user.firstName).toEqual('John');
		expect(user.lastName).toEqual('Smith');
	});

	test('Array Object Deserialize', () => {
		const users = Deserializer.deserialize(userArray) as SerializableArray<User>;
		expect((users as any).isSerializable).toBeTruthy();
		expect(users).toBeInstanceOf(SerializableArray);
		expect((users as any).$SCLASS).toBeDefined();
		expect(users[0].email).toEqual('john.smith-0@email.com');
		expect(users[0].firstName).toEqual('John');
		expect(users[0].lastName).toEqual('Smith');
	});

	test('Map Object Deserialize', () => {
		const users = Deserializer.deserialize(userMap) as SerializableMap<string, User>;
		expect((users as any).isSerializable).toBeTruthy();
		expect(users).toBeInstanceOf(SerializableMap);
		expect((users as any).$SCLASS).toBeDefined();
		expect(users.get('0')?.email).toEqual('john.smith-0@email.com');
		expect(users.get('0')?.firstName).toEqual('John');
		expect(users.get('0')?.lastName).toEqual('Smith');
	});

	test('Deserialize error handling', () => {
		const foo = {};
		expect(() => {
			Deserializer.deserialize(foo);
		}).toThrow();

		const foo2 = {
			$SCLASS: 'bar',
		};

		const origError = console.error;
		console.error = jest.fn();
		expect(() => {
			Deserializer.deserialize(foo2);
		}).toThrow();
		expect(console.error).toHaveBeenCalled();
		console.error = origError;
	});
});
