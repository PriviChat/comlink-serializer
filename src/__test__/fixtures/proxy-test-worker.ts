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
	async getAddressStreet(addressProxy: Address): Promise<string> {
		if (!isProxy(addressProxy)) throw TypeError('Not a proxy!');
		const street = await addressProxy.street;
		return street;
	}

	/**
	 *  Returns the products in an order.
	 *	Products is not a proxy.
	 * @param {Order} order - Order - the proxy order object that we're going to get the product count for
	 * @returns {Array} The products in the order.
	 */
	async getOrderProducts(orderProxy: Order): Promise<Array<Product>> {
		if (!isProxy(orderProxy)) throw TypeError('Not a proxy!');
		const rtnArr = new Array<Product>();
		for (const prod of await orderProxy.productArr) {
			rtnArr.push(prod);
		}
		return toSerial(rtnArr);
	}

	/**
	 *  Returns the products in an order.
	 *	Products is not a proxy.
	 * @param {Order} order - Order - the proxy order object that we're going to get the product count for
	 * @returns {Set} - The products in the order.
	 */
	async getOrderProductsSet(orderProxy: Order): Promise<Set<Product>> {
		if (!isProxy(orderProxy)) throw TypeError('Not a proxy!');
		const rtnSet = new Set<Product>();
		for await (const prod of await orderProxy.productSetProxy) {
			rtnSet.add(prod);
		}
		return toSerial(rtnSet);
	}

	/**
	 * Returns the addresses for the user of the given order.
	 * User is also a proxy on Order and Addresses is a proxy on User.
	 * @param {Order} order - Order - The order object that we want to get the user's addresses from.
	 * @returns {Array} An array of addresses
	 */
	async getOrderUserAddresses(orderProxy: Order): Promise<Array<Address>> {
		if (!isProxy(orderProxy)) throw TypeError('Not a proxy!');
		const rtnArr = new Array<Address>();
		// await is needed to fetch the addressses iterator
		for await (const address of await orderProxy.userProxy.addressArrProxy) {
			rtnArr.push(address);
		}
		return toSerial(rtnArr);
	}
}
Comlink.expose(ProxyTestWorker);
ComlinkSerializer.registerTransferHandler({ transferClasses: [User, Order, Product, Address] });
