import { Serializable, hashCd } from '@comlink-serializer';
import { ProductClass, SerializedProduct } from './types';

@Serializable(ProductClass)
class Product implements Serializable<SerializedProduct> {
	constructor(readonly productId: string, readonly productName: string) {}

	public hashCode(): number {
		return hashCd(this.productId);
	}

	public equals(other: unknown) {
		return other instanceof Product && other.productId === this.productId;
	}
}

export default Product;
