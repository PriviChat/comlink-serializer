import * as Comlink from 'comlink';
import ComlinkSerializer, { toSerial } from 'comlink-serializer';
import User from '../dto/user';
import Order from '../dto/order';
import Address from '../dto/address';
import Product from '../dto/product';

export default class HardWorker {
	/**
	 * For each address in the array, add the zip code to the zipCt variable.
	 * @param addrArr - AsyncIterableIterator<Address>
	 * @returns The sum of all the zip codes in the array.
	 */
	async processArrayIterator(addrArr: AsyncIterableIterator<Address>): Promise<number> {
		let ct = 0;
		for await (const addr of addrArr) {
			ct += 1;
		}
		return ct;
	}
}
Comlink.expose(HardWorker);
ComlinkSerializer.registerTransferHandler({ transferClasses: [User, Order, Product, Address] });
