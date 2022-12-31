import * as Comlink from 'comlink';
import { fluentAsync } from 'fluent-iterable';
import ComlinkSerializer, { SerialMap, AsyncSerialIterable } from '@comlink-serializer';
import User from '@test-fixtures/User';

export default class IterableTestWorker {
	async getUserCount(users: AsyncSerialIterable<User>): Promise<number> {
		let count = 0;
		for await (const user of users) {
			count += 1;
		}
		return count;
	}

	async getTotalOrders(users: AsyncSerialIterable<User>, method: 'for-await' | 'reduce'): Promise<number> {
		let total = 0;
		if (method === 'for-await') {
			for await (const user of users) {
				total += user.totalOrders;
			}
		} else if (method === 'reduce') {
			const flUsers = fluentAsync(users);
			flUsers.reduce((total, user) => {
				return total + user.totalOrders;
			}, 0);
		}
		return total;
	}

	getMap(map: SerialMap<string, User>) {
		return map;
	}
}
Comlink.expose(IterableTestWorker);
ComlinkSerializer.registerTransferHandler({ transferClasses: [User] });
