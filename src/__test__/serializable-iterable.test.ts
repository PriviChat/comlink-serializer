import { expect, test } from '@jest/globals';
import User from '@test-fixtures/user';
import { makeObj } from './fixtures';

import { toSerialIterator } from '@comlink-serializer';

describe('SerialIterable Tests', () => {
	test('Iterator accepts empty array', async () => {
		const userItr = toSerialIterator(new Array<User>());
		let idx = 0;
		let total = 0;

		for await (const user of userItr) {
			total += user.totalOrders;
			idx += 1;
			return;
		}
		expect(idx).toBe(0);
		expect(total).toBe(0);
	});

	test('Iterator properly serializes array of users', async () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		user0.totalOrders = 5;
		user1.totalOrders = 10;

		const userItr = toSerialIterator([user0, user1]);

		let idx = 0;
		let total = 0;
		for await (const serUser of userItr) {
			expect(serUser.email).toBe('bob@email.org_' + idx);
			expect(serUser.firstName).toBe('Bob_' + idx);
			expect(serUser.lastName).toBe('Smith_' + idx);
			total += serUser.totalOrders;
			idx += 1;
		}
		expect(idx).toEqual(2);
		expect(total).toEqual(15);
	});

	test('Iterator properly serializes map of users', async () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		user0.totalOrders = 5;
		user1.totalOrders = 10;

		const userMap = new Map([
			['0', user0],
			['1', user1],
		]);

		const userItr = toSerialIterator(userMap);

		let idx = 0;
		let total = 0;
		for await (const [id, serUser] of userItr) {
			expect(id).toBe(idx.toString());
			expect(serUser.email).toBe('bob@email.org_' + idx);
			expect(serUser.firstName).toBe('Bob_' + idx);
			expect(serUser.lastName).toBe('Smith_' + idx);
			total += serUser.totalOrders;
			idx += 1;
		}
		expect(idx).toBe(2);
		expect(total).toBe(15);
	});

	test('Iterator properly returns', async () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		user0.totalOrders = 3;
		user1.totalOrders = 10;

		const arr = new Array<User>(user0, user1);
		const userItr = toSerialIterator(arr);

		let idx = 0;
		let total = 0;

		for await (const serUser of userItr) {
			total += serUser.totalOrders;
			idx += 1;
			return;
		}
		expect(idx).toBe(1);
		expect(total).toBe(3);
	});
});
