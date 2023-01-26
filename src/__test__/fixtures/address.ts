import { Serializable, hashCd } from '@comlink-serializer';
import { AddressClass } from './types';

@Serializable(AddressClass)
export default class Address {
	constructor(
		readonly id: string,
		readonly street: string,
		readonly city: string,
		readonly state: string,
		readonly zip: number
	) {}

	public hashCode(): number {
		return hashCd(this.id);
	}

	public equals(other: unknown) {
		return false;
	}
}
