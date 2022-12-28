import { Serializable } from '@comlink-serializer';
import { SerializedProduct } from './types';

@Serializable()
class Product {
	constructor(readonly productId: string, readonly productName: string) {}

	public deserialize(data: SerializedProduct): Product {
		return null;
	}

	public serialize(): SerializedProduct {
		return null;
	}
}

export default Product;
