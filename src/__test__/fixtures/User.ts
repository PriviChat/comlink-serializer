import { Serializable, hashCd } from '@comlink-serializer';
import { SerializedUser } from './types';

@Serializable({ class: 'User' })
export default class User implements Serializable<SerializedUser> {
	constructor(
		readonly email: string,
		readonly firstName: string,
		readonly lastName: string,
		readonly totalOrders: number = 0
	) {}

	public serialize(): SerializedUser {
		return {
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName,
			totalOrders: this.totalOrders,
		};
	}

	public equals(other: unknown): boolean {
		return other instanceof User && other.email === this.email;
	}

	public hashCode(): number {
		return hashCd(this.email);
	}
}
