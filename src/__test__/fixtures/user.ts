import { Serializable, Serialize, Revivable, hashCd } from '@comlink-serializer';
import Address from './address';
import { AddressClass, SerializedUser, UserClass } from './types';

@Serializable(UserClass)
export default class User implements Serializable<SerializedUser>, Revivable<SerializedUser> {
	@Serialize()
	private priAddress: Address;

	@Serialize({ classToken: AddressClass, proxy: false })
	readonly addressArr: Address[];

	@Serialize({ classToken: AddressClass, proxy: true })
	readonly addressArrProxy: Address[];

	constructor(
		readonly email: string,
		readonly firstName: string,
		readonly lastName: string,
		priAddress: Address,
		addressArr: Address[],
		public totalOrders: number = 0
	) {
		this.priAddress = priAddress;
		this.addressArr = addressArr;
		this.addressArrProxy = new Array(...addressArr);
	}

	public setOrderTotal(total: number) {
		this.totalOrders = total;
	}

	public setPriAddress(address: Address) {
		this.priAddress = address;
	}

	public getPriAddress() {
		return this.priAddress;
	}

	public hashCode(): number {
		return hashCd(this.email);
	}

	public equals(other: unknown) {
		return other instanceof User && other.email === this.email;
	}
}
