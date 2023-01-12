import * as Comlink from 'comlink';
import ComlinkSerializer from '@comlink-serializer';
import User from '@test-fixtures/User';
import Order from '@test-fixtures/Order';

export default class LazyTestWorker {
	getUser(user: User) {
		return user;
	}

	async getArray(arr: Array<User>) {
		return arr;
	}

	async getUserCount(users: Array<User>): Promise<number> {
		let count = 0;
		for await (const user of users) {
			count += 1;
		}
		return count;
	}

	async getOrderUser(order: Order): Promise<User> {
		const user = await order.user;
		const last = await user.lastName;
		//const addresses = await user.addresses;
		let ct = 0;
		for await (const address of user.addresses) {
			ct += 1;
		}
		return user;
	}

	async getMap(map: Map<string, User>) {
		return map;
	}
}
Comlink.expose(LazyTestWorker);
ComlinkSerializer.registerTransferHandler({ transferClasses: [User] });
