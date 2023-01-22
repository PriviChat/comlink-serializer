import { expect, test } from '@jest/globals';
import User from '@test-fixtures/user';
import { SerializedUser, UserClass } from '@test-fixtures/types';
import SerialSymbol from '../serial/serial-symbol';
import { makeObj } from './fixtures';

import { serializeIterator } from '@comlink-serializer';
import { SerialIterable } from 'src/serial/iterable';

describe('SerializableIterable Tests', () => {
	test('Iterator accepts empty array', async () => {
		const userItr = serializeIterator(new Array<User>());
		let idx = 0;
		let total = 0;

		for await (const user of userItr as AsyncIterable<SerializedUser>) {
			total += user.totalOrders;
			idx += 1;
			return;
		}
		expect(idx).toEqual(0);
		expect(total).toEqual(0);
	});

	test('Iterator properly serializes', async () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		user0.totalOrders = 5;
		user1.totalOrders = 10;

		const userItr = new SerialIterable<SerializedUser, User>([user0, user1].values());

		let idx = 0;
		let total = 0;
		for await (const serUser of userItr) {
			const meta = serUser[SerialSymbol.serialized];
			expect(meta).toBeDefined();
			expect(meta?.classToken).toEqual(UserClass.toString());
			expect(meta?.hash).toBeDefined();
			expect(serUser.email).toEqual('bob@email.org_' + idx);
			expect(serUser.firstName).toEqual('Bob_' + idx);
			expect(serUser.lastName).toEqual('Smith_' + idx);
			total += serUser.totalOrders;
			idx += 1;
		}
		expect(idx).toEqual(2);
		expect(total).toEqual(15);
	});

	test('Iterator properly returns', async () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		user0.totalOrders = 3;
		user1.totalOrders = 10;

		const arr = new Array<User>(user0, user1);
		const userItr = serializeIterator<SerializedUser, User>(arr);
		let idx = 0;
		let total = 0;

		for await (const serUser of userItr) {
			total += serUser.totalOrders;
			idx += 1;
			return;
		}
		expect(idx).toEqual(1);
		expect(total).toEqual(3);
	});
});
