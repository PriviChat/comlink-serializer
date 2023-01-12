import { Serializable, Serialize } from '@comlink-serializer';
import Product from './Product';
import User from './User';
import { OrderClass, ProductClass, SerializedOrder, UserClass } from './types';

@Serializable(OrderClass)
class Order implements Serializable<SerializedOrder> {
	readonly orderId: string;

	@Serialize(UserClass, true)
	readonly user: User;

	@Serialize(ProductClass)
	readonly products: Product[];

	constructor(orderId: string, user: User, products: Product[]) {
		this.orderId = orderId;
		this.user = user;
		this.products = products;
	}

	public equals(other: unknown): boolean {
		return other instanceof Order && other.orderId === this.orderId;
	}

	public hashCode(): number {
		throw new Error('Method not implemented.');
	}
}

export default Order;
