import { Serializable } from '@comlink-serializer';
import { SerializedProduct } from './types';

@Serializable
class Product implements Serializable<SerializedProduct> {
	constructor(readonly productId: string, readonly productName: string) {}

	static deserialize(data: SerializedProduct): Product {
		return Object.assign(Object.create(Product.prototype), data);
	}

	public serialize(): SerializedProduct {
		return {
			productId: this.productId,
			productName: this.productName,
		};
	}
}

export default Product;
