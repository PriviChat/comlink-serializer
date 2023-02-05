import * as Comlink from 'comlink';
import { fluentAsync } from 'fluent-iterable';
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

	async getTotalOrders(users: AsyncIterableIterator<User>): Promise<number> {
		let total = 0;

		for await (const user of users) {
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
