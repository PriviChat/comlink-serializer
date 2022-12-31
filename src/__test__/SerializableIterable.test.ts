import { expect, test } from '@jest/globals';
import User from '@test-fixtures/User';
import { SerializableIterable, SerialSymbol } from '@comlink-serializer-internal';
import { SymClassMap, SymRegIdMap } from '@test-fixtures/SymMap';
import { SerializedUser } from '@test-fixtures/types';

describe('SerializableIterable Tests', () => {
	test('Iterator accepts empty array', async () => {
		const userItr = new SerializableIterable<SerializedUser>([]);
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
		const userItr = new SerializableIterable<SerializedUser>([user0, user1]);

		let idx = 0;
		let total = 0;
		for await (const serUser of userItr) {
			const meta = serUser[SerialSymbol.serializable]!();
			expect(meta).toBeDefined();
			expect(meta?.rid).toEqual(SymRegIdMap.User);
			expect(meta?.cln).toEqual(SymClassMap.User);
			expect(meta?.hsh).toBeDefined();
			expect(serUser.email).toEqual('roy@example.org_' + idx);
			expect(serUser.firstName).toEqual('Roy_' + idx);
			expect(serUser.lastName).toEqual('Smith_' + idx);
			total += serUser.totalOrders;
			idx += 1;
		}
		expect(idx).toEqual(2);
		expect(total).toEqual(15);
	});

	test('Iterator properly returns', async () => {
		const user0 = new User('roy@example.org_0', 'Roy_0', 'Smith_0', 3);
		const user1 = new User('roy@example.org_1', 'Roy_1', 'Smith_1', 10);
		const userItr = new SerializableIterable<SerializedUser>([user0, user1]);
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
