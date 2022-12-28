import * as Comlink from 'comlink';
import ComlinkSerializer, { SerialArray, SerialMap } from '@comlink-serializer';
import User from '@test-fixtures/User';

export default class TestWorker {
	getUser(user: User) {
		return user;
	}

	async getArray(users: SerialArray<User>) {
		return await users;
	}

	async getArrayLength(arr: SerialArray<User>): Promise<number> {
		const len = await arr.length;
		return len;
	}

	async getTotalOrders(arr: SerialArray<User>): Promise<number> {
		let total = 0;
		for await (const user of arr) {
			total += user.totalOrders;
		}
		return total;
	}

	getMap(map: SerialMap<string, User>) {
		return map;
	}
}
Comlink.expose(TestWorker);
ComlinkSerializer.registerTransferHandler({ transferClasses: [User] });
