import { Serializable, Serialize, hashCd } from '@comlink-serializer';
import Address from './address';
import { AddressClass, SerializedUser, UserClass } from './types';

@Serializable(UserClass)
export default class User implements Serializable<SerializedUser> {
	@Serialize()
	readonly priAddress: Address;
	@Serialize({ classToken: AddressClass, proxy: true })
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

	public setOrderTotal(total: number) {
		this.totalOrders = total;
	}

	public getPrimaryAddress() {
		return this.priAddress;
	}

	public hashCode(): number {
		return hashCd(this.email);
	}

	public equals(other: unknown) {
		return other instanceof User && other.email === this.email;
	}
}
