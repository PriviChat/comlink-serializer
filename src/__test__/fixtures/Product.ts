import { Serializable, hash } from '@comlink-serializer';
import { SerializedProduct } from './types';

@Serializable()
class Product implements Serializable<SerializedProduct> {
	constructor(readonly productId: string, readonly productName: string) {}

	public serialize(): SerializedProduct {
		// this means use default serialization
		// which is JSON.stringify()
		return {} as any;
	}

	public equals(other: unknown): boolean {
		return other instanceof Product && other.productId === this.productId;
	}

	public hashCode(): number {
		return hash(this.productId);
	}
}

export default Product;
