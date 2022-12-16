import { Serializable, Deserializable } from '@comlink-serializer';
import { SerializedUser } from './types';

@Serializable
export default class User implements Serializable<SerializedUser>, Deserializable<SerializedUser, User> {
	constructor(readonly email: string, readonly firstName: string, readonly lastName: string) {}

	public deserialize(data: SerializedUser): User {
		return Object.assign(this, data);
	}

	public serialize(): SerializedUser {
		return {
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName,
		};
	}
}
