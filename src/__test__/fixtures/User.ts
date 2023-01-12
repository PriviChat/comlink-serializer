import { Serializable, Serialize, hashCd } from '@comlink-serializer';
import Address from './address';
import { AddressClass, SerializedUser, UserClass } from './types';

@Serializable(UserClass)
export default class User implements Serializable<SerializedUser> {
	@Serialize()
	readonly priAddress: Address;
	@Serialize(AddressClass)
	readonly addresses: Address[];

	constructor(
		readonly email: string,
		readonly firstName: string,
		readonly lastName: string,
		priAddress: Address,
		addresses: Address[],
		public totalOrders: number = 0
	) {
		this.priAddress = priAddress;
		this.addresses = addresses;
	}

	public equals(other: unknown): boolean {
		return other instanceof User && other.email === this.email;
	}

	public hashCode(): number {
		return hashCd(this.email);
	}
}
