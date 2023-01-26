import * as Comlink from 'comlink';
import ComlinkSerializer from '@comlink-serializer';
import User from '@test-fixtures/user';
import Order from '@test-fixtures/order';
import Product from '@test-fixtures/product';
import Address from '@test-fixtures/address';

export default class SerializableTestWorker {
	getUser(user: User) {
		return user;
	}

	getOrder(order: Order) {
		return order;
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

	async getTotalOrders(arr: Array<User>, method: 'for-await' | 'reduce'): Promise<number> {
		let total = 0;
		if (method === 'for-await') {
			for await (const user of arr) {
				total += user.totalOrders;
			}
		} else if (method === 'reduce') {
			total = arr.reduce((accum, user) => {
				return accum + user.totalOrders;
			}, 0);
		}
		return total;
	}

	async getMap(map: Map<any, User>) {
		return map;
	}
}
Comlink.expose(SerializableTestWorker);
ComlinkSerializer.registerTransferHandler({ transferClasses: [User, Address, Product, Order] });
