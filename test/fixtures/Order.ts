import { Serializable, SerializableArray } from '../../src';
import { Product } from './Product';
import { SerializedOrder } from './types';
import { User } from './User';

@Serializable<SerializedOrder, Order>()
export class Order {
	constructor(readonly orderId: string, readonly user: User, readonly products: SerializableArray<Product>) {}

	static deserialize(data: SerializedOrder): Order {
		return Object.assign(Object.create(Order.prototype), data);
	}

	public serialize() {
		return {
			orderId: this.orderId,
			user: this.user.serialize(),
		};
	}
}
