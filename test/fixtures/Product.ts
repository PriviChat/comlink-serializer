import { Serializable } from '../../src';
import { SerializedProduct } from './types';

@Serializable()
export class Product implements Serializable<SerializedProduct> {
	constructor(readonly productId: string, readonly productName: string) {}

	static deserialize(data: SerializedProduct): Product {
		return Object.assign(Object.create(Product.prototype), data);
	}

	public serialize() {
		return {
			productId: this.productId,
			productName: this.productName,
		};
	}
}
