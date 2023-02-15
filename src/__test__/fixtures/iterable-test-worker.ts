import * as Comlink from 'comlink';
import ComlinkSerializer from '@comlink-serializer';
import User from '@test-fixtures/user';

export default class IterableTestWorker {
	async getUserCount(users: AsyncIterableIterator<User>): Promise<number> {
		let count = 0;
		for await (const user of users) {
			count += 1;
		}
		return count;
	}

	async getTotalOrdersArray(users: AsyncIterableIterator<User>): Promise<number> {
		let total = 0;

		for await (const user of users) {
			total += user.totalOrders;
		}

		return total;
	}

	async getTotalOrdersSet(users: AsyncIterableIterator<User>): Promise<number> {
		let total = 0;

		for await (const user of users) {
			total += user.totalOrders;
		}

		return total;
	}

	async getTotalOrdersBreakAfterFirstArray(users: AsyncIterableIterator<User>): Promise<number> {
		let total = 0;

		for await (const user of users) {
			total += user.totalOrders;
			break;
		}

		return total;
	}

	async getTotalOrdersMap(users: AsyncIterableIterator<[number, User]>): Promise<number> {
		let total = 0;

		for await (const [idx, user] of users) {
			if (!(typeof idx === 'number')) return -1;
			total += user.totalOrders;
		}

		return total;
	}

	getMap(map: Map<string, User>) {
		return map;
	}
}
Comlink.expose(IterableTestWorker);
ComlinkSerializer.registerTransferHandler({ transferClasses: [User] });
