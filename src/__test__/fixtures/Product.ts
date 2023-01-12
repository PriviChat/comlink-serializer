import { Serializable, hashCd } from '@comlink-serializer';
import { ProductClass, SerializedProduct } from './types';

@Serializable(ProductClass)
class Product implements Serializable<SerializedProduct> {
	constructor(readonly productId: string, readonly productName: string) {}

	public equals(other: unknown): boolean {
		return other instanceof Product && other.productId === this.productId;
	}

	public hashCode(): number {
		return hashCd(this.productId);
	}
}

export default Product;
