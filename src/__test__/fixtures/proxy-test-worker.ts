import * as Comlink from 'comlink';
import ComlinkSerializer from '@comlink-serializer';
import User from '@test-fixtures/user';
import Order from '@test-fixtures/order';
import Product from '@test-fixtures/product';
import Address from '@test-fixtures/address';

export default class ProxyTestWorker {
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
		const id = order.orderId;
		const user = order.user;
		const last = await user.lastName;
		const addresses = await user.addresses;
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
Comlink.expose(ProxyTestWorker);
ComlinkSerializer.registerTransferHandler({ transferClasses: [User, Order, Product, Address] });
