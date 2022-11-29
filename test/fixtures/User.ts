import { Serializable, Serializer } from '../../src';
import { SerializedUser } from './types';

@Serializable<SerializedUser, User>()
export class User {
	constructor(readonly email: string, readonly firstName: string, readonly lastName: string) {}

	static deserialize(data: SerializedUser) {
		return Object.assign(Object.create(User.prototype), data) as User;
	}

	public serialize() {
		return {
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName,
		};
	}
}
