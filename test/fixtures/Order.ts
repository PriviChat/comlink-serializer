import { SerializableArray, Serializable } from '../../src';
import Product from './Product';
import User from './User';
import { SerializedOrder } from './types';

@Serializable
class Order {
	constructor(readonly orderId: string, readonly user: User, readonly products: SerializableArray<Product>) {}

	static deserialize(data: SerializedOrder): Order {
		return Object.assign(Object.create(Order.prototype), data);
	}

	public serialize(): SerializedOrder {
		return {
			orderId: this.orderId,
			user: this.user.serialize(),
		};
	}
}

export default Order;
