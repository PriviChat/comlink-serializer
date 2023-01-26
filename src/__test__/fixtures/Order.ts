import { hashCd, Serializable, Serialize } from '@comlink-serializer';
import Product from './product';
import User from './user';
import { OrderClass, ProductClass, SerializedOrder } from './types';

@Serializable(OrderClass)
class Order implements Serializable<SerializedOrder> {
	readonly orderId: string;

	@Serialize(true)
	readonly user: User;

	@Serialize(ProductClass)
	readonly products: Product[];

	constructor(orderId: string, user: User, products: Product[]) {
		this.orderId = orderId;
		this.user = user;
		this.products = products;
	}

	public hashCode(): number {
		return hashCd(this.orderId);
	}

	public equals(other: unknown) {
		return false;
	}
}

export default Order;
