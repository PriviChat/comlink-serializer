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

	public getStreet() {
		return this.street;
	}

	public hashCode(): number {
		//return -1;
		return hashCd(this.id);
	}

	public equals(other: unknown) {
		return other instanceof Address && other.id === this.id;
	}
}
