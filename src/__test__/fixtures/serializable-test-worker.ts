import * as Comlink from 'comlink';
import ComlinkSerializer, { toSerial } from '@comlink-serializer';
import User from '@test-fixtures/user';
import Order from '@test-fixtures/order';
import Product from '@test-fixtures/product';
import Address from '@test-fixtures/address';

export default class SerializableTestWorker {
	/**
	 * Receives a revived User object from the main thread and passes it back.
	 * @param {User} user - User - The user object that is being passed in.
	 * @returns {User} - The user object
	 */
	getUser(user: User) {
		return user;
	}

	/**
	 * Receives a revived Order object from main thread and passes it back.
	 * @param {Order} order - Order - The order object that is being passed in.
	 * @returns {Order} - The order object
	 */
	getOrder(order: Order) {
		return order;
	}

	/**
	 * User is a proxy on Order. User.priAddress {Address} property is fetched from the main thread.
	 * The resulting Address object has been revived so it includes it's prototype. The Adress object is then
	 * returned back to the main thread where it also has been revived.
	 * @param {Order} order - Order
	 * @returns {Address} The primary address of the user who placed the order.
	 */
	async getOrderUserAddress(order: Order) {
		const priAddress = await order.user.priAddress;
		return priAddress;
	}

	/**
	 * User is a proxy on Order. User.getPrimaryAddress() function that fetches the {Address} from the main thread.
	 * The resulting Address object has been revived so it includes it's prototype. The Adress object is then
	 * returned back to the main thread where it also has been revived.
	 * @param {Order} order - Order
	 * @returns {Address} The primary address of the user who placed the order.
	 */
	async callOrderUserGetPrimaryAddress(order: Order) {
		const priAddress = await order.user.getPrimaryAddress();
		return priAddress;
	}

	/**
	 * User is a proxy on Order. User.addresses {Address} is a proxy on User and is fetched from the main thread.
	 * The resulting Address[] object has been revived so it includes it's prototype. The Address[] is then
	 * wrapped in toSerial() and returned back to the main thread where it also has been revived.
	 * @param {Order} order - Order
	 * @returns {Promise<Address[]>} The addresses of the user who placed the order.
	 */
	async getOrderUserAddresses(order: Order): Promise<Address[]> {
		const rtnArr = new Array<Address>();
		// await is needed to fetch the addressses iterator
		for await (const address of await order.user.addresses) {
			rtnArr.push(address);
		}
		return toSerial(rtnArr);
	}

	/**
	 * User is a proxy on Order. User.setOrderTotal() is a callback to the main thread.
	 *
	 * @param {Order} order - Order - The order that was just created
	 * @param {number} total - The total number of orders the user has.
	 */
	async callOrderUserSetOrderTotal(order: Order, total: number) {
		await order.user.setOrderTotal(total);
	}
	/**
	 * User is a proxy on Order. User.totalOrders property is set on the main thread.
	 * We are unable to await the response.
	 *
	 * @param {Order} order - Order - The order object that is being passed in.
	 * @param {number} total - The total number of orders for the user.
	 */
	async setOrderUserTotalOrders(order: Order, total: number) {
		order.user.totalOrders = total;
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
