import { hashCd, Serializable, Serialize } from '@comlink-serializer';
import Product from './product';
import User from './user';
import Address from './address';
import { OrderClass, ProductClass, SerializedOrder } from './types';
import { cloneDeep } from 'lodash';

@Serializable(OrderClass)
class Order implements Serializable<SerializedOrder> {
	readonly orderId: string;

	@Serialize(true)
	readonly userProxy: User;

	@Serialize()
	readonly user: User;

	@Serialize(false)
	private address: Address;

	@Serialize(ProductClass)
	readonly products: Product[];

	constructor(orderId: string, user: User, address: Address, products: Product[]) {
		this.orderId = orderId;
		this.userProxy = user;
		this.user = cloneDeep(user);
		this.address = address;
		this.products = products;
	}

	public setAddress(address: Address) {
		this.address = address;
	}

	public getAddress() {
		return this.address;
	}

	public hashCode(): number {
		return hashCd(this.orderId);
	}

	public equals(other: unknown) {
		return other instanceof Order && other.orderId === this.orderId;
	}
}

export default Order;
