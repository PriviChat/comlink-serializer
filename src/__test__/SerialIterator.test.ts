import { expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import { _$ } from '@comlink-serializer';
import IdMap from '@test-fixtures/IdMap';
import { SerializedUser } from '@test-fixtures/types';

describe('SerialIterator Tests', () => {
	test('Iterator has symbol', () => {
		const userItr = new _$.SerialIterator<User>([]);
		expect(userItr[_$.SerialSymbol.iterator]).toBeTruthy();
	});

	test('Iterator accepts empty array', () => {
		const userItr = new _$.SerialIterator<User>([]);
		let idx = 0;
		let total = 0;

		for (const serial of userItr) {
			const user = serial as SerializedUser;
			total += user.totalOrders;
			idx += 1;
			return;
		}
		expect(idx).toEqual(0);
		expect(total).toEqual(0);
	});

	test('Iterator properly serializes', () => {
		const user0 = new User('roy@example.org_0', 'Roy_0', 'Smith_0', 5);
		const user1 = new User('roy@example.org_1', 'Roy_1', 'Smith_1', 10);
		const userItr = new _$.SerialIterator<User>([user0, user1]);

		let idx = 0;
		let total = 0;
		for (const serial of userItr) {
			expect(serial[_$.SerialSymbol.registryId]).toEqual(IdMap.User);
			const user = serial as SerializedUser;
			expect(user.email).toEqual('roy@example.org_' + idx);
			expect(user.firstName).toEqual('Roy_' + idx);
			expect(user.lastName).toEqual('Smith_' + idx);
			total += user.totalOrders;
			idx += 1;
		}
		expect(idx).toEqual(2);
		expect(total).toEqual(15);
	});

	test('Iterator properly returns', () => {
		const user0 = new User('roy@example.org_0', 'Roy_0', 'Smith_0', 3);
		const user1 = new User('roy@example.org_1', 'Roy_1', 'Smith_1', 10);
		const userItr = new _$.SerialIterator<User>([user0, user1]);
		let idx = 0;
		let total = 0;

		for (const serial of userItr) {
			const user = serial as SerializedUser;
			total += user.totalOrders;
			idx += 1;
			return;
		}
		expect(idx).toEqual(1);
		expect(total).toEqual(3);
	});
});
