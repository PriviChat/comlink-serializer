import { Serializable, Deserializer } from '@comlink-serializer';
import Product from './Product';
import User from './User';
import { SerializedOrder } from './types';

@Serializable
class Order implements Serializable<SerializedOrder> {
	constructor(readonly orderId: string, readonly user: User, readonly products: Product[]) {}

	public deserialize(data: SerializedOrder, deserializer: Deserializer): Order {
		const user = deserializer.deserialize(data.user);
		const products = data.products.map((product) => deserializer.deserialize(product));
		return Object.assign(Object.create(Order.prototype), { ...data, user, products });
	}

	public serialize(): SerializedOrder {
		return {
			orderId: this.orderId,
			user: this.user.serialize(),
			products: this.products.map((product) => product.serialize()),
		};
	}
}

export default Order;
