import { Serializable, Reviver } from '@comlink-serializer';
import Product from './Product';
import User from './User';
import { SerializedOrder } from './types';

@Serializable()
class Order implements Serializable<SerializedOrder> {
	constructor(readonly orderId: string, readonly user: User, readonly products: Product[]) {}

	public serialize(): SerializedOrder {
		return {
			orderId: this.orderId,
			user: this.user.serialize(),
			products: this.products.map((product) => product.serialize()),
		};
	}

	public equals(other: unknown): boolean {
		return other instanceof Order && other.orderId === this.orderId;
	}

	public hashCode(): number {
		throw new Error('Method not implemented.');
	}
}

export default Order;
