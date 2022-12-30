import * as Comlink from 'comlink';
import ComlinkSerializer, { SerialArray, SerialMap } from '@comlink-serializer';
import User from '@test-fixtures/User';

export default class SerializableTestWorker {
	getUser(user: User) {
		return user;
	}

	async getArray(arr: SerialArray<User>) {
		return arr;
	}

	async getUserCount(users: SerialArray<User>): Promise<number> {
		let count = 0;
		for await (const user of users) {
			count += 1;
		}
		return count;
	}

	async getTotalOrders(arr: SerialArray<User>, method: 'for-await' | 'reduce'): Promise<number> {
		if (method === 'for-await') {
			let total = 0;
			for await (const user of arr) {
				total += user.totalOrders;
			}
			return total;
		} else if (method === 'reduce') {
			return arr.reduce((accum, user) => {
				return accum + user.totalOrders;
			}, 0);
		}
	}

	async getMap(map: SerialMap<string, User>) {
		return map;
	}
}
Comlink.expose(SerializableTestWorker);
ComlinkSerializer.registerTransferHandler({ transferClasses: [User] });
