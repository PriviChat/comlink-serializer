import { expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import { Serialized } from '@comlink-serializer';
import { SerializableIterable, SerialSymbol } from '@comlink-serializer-internal';
import { SymRegIdMap } from '@test-fixtures/SymMap';
import { SerializedUser } from '@test-fixtures/types';

describe('SerializableIterable Tests', () => {
	test('Iterator accepts empty array', async () => {
		const userItr = new SerializableIterable<User>([]);
		let idx = 0;
		let total = 0;

		for await (const serial of userItr) {
			const user = serial as SerializedUser;
			total += user.totalOrders;
			idx += 1;
			return;
		}
		expect(idx).toEqual(0);
		expect(total).toEqual(0);
	});

	test('Iterator properly serializes', async () => {
		const user0 = new User('roy@example.org_0', 'Roy_0', 'Smith_0', 5);
		const user1 = new User('roy@example.org_1', 'Roy_1', 'Smith_1', 10);
		const userItr = new SerializableIterable<User>([user0, user1]);

		let idx = 0;
		let total = 0;
		for await (const serial of userItr) {
			const regIdKey = SerialSymbol.registryId.description as keyof Serialized;
			expect(serial[regIdKey]).toEqual(SymRegIdMap.User);
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

	test('Iterator properly returns', async () => {
		const user0 = new User('roy@example.org_0', 'Roy_0', 'Smith_0', 3);
		const user1 = new User('roy@example.org_1', 'Roy_1', 'Smith_1', 10);
		const userItr = new SerializableIterable<User>([user0, user1]);
		let idx = 0;
		let total = 0;

		for await (const serial of userItr) {
			const user = serial as SerializedUser;
			total += user.totalOrders;
			idx += 1;
			return;
		}
		expect(idx).toEqual(1);
		expect(total).toEqual(3);
	});
});
