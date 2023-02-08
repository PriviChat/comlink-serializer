import * as Comlink from 'comlink';
import ComlinkSerializer, { toSerial } from '@comlink-serializer';
import User from '@test-fixtures/user';
import Order from '@test-fixtures/order';
import Product from '@test-fixtures/product';
import Address from '@test-fixtures/address';
import { isProxy } from '../../serial/utils';

export default class ProxyTestWorker {
	/**
	 * Returns the street property of a proxy Address
	 * If the address is not a proxy, return NOT_A_PROXY
	 *
	 * @param {Address} address - Address - Should be a proxy
	 * @returns {string} street - The street property of {Address}
	 */
	async getAddressStreet(address: Address): Promise<string> {
		if (!isProxy(address)) throw TypeError('Not a proxy!');
		const street = await address.street;
		return street;
	}

	/**
	 *  Returns the products in an order.
	 *	Products is not a proxy.
	 * @param {Order} order - Order - the proxy order object that we're going to get the product count for
	 * @returns The products in the order.
	 */
	async getOrderProducts(order: Order): Promise<Array<Product>> {
		if (!isProxy(order)) throw TypeError('Not a proxy!');
		const rtnArr = new Array<Product>();
		for (const prod of await order.products) {
			rtnArr.push(prod);
		}
		return toSerial(rtnArr);
	}

	/**
	 * Returns the addresses for the user of the given order.
	 * User is also a proxy on Order and Addresses is a proxy on User.
	 * @param {Order} order - Order - The order object that we want to get the user's addresses from.
	 * @returns An array of addresses
	 */
	async getOrderUserAddresses(order: Order): Promise<Array<Address>> {
		if (!isProxy(order)) throw TypeError('Not a proxy!');
		const rtnArr = new Array<Address>();
		// await is needed to fetch the addressses iterator
		for await (const address of await order.userProxy.addresses) {
			rtnArr.push(address);
		}
		return toSerial(rtnArr);
	}
}
Comlink.expose(ProxyTestWorker);
ComlinkSerializer.registerTransferHandler({ transferClasses: [User, Order, Product, Address] });
