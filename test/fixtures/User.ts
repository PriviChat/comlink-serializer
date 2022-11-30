import { Serializable } from '../../src/serial/mixin';
import { SerializedUser } from './types';

@Serializable
export class User implements Serializable<SerializedUser> {
	constructor(readonly email: string, readonly firstName: string, readonly lastName: string) {}

	static deserialize(data: SerializedUser): User {
		return Object.assign(Object.create(User.prototype), data);
	}

	public serialize(): SerializedUser {
		return {
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName,
		};
	}
}
