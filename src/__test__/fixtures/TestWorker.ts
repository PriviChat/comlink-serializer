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

	getArrayLength(arr: SerialArray<User>): number {
		return arr.length;
	}

	async getTotalOrders(userArray: SerialArray<User>): Promise<number> {
		let total = 0;
		for await (const user of userArray) {
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
