import { Serializable } from '@comlink-serializer';
import { SerializedUser } from './types';

@Serializable
export default class User implements Serializable<SerializedUser> {
	constructor(readonly email: string, readonly firstName: string, readonly lastName: string) {}

	static deserialize(data: SerializedUser): User {
		//return new User(data.email, data.firstName, data.lastName);
		const user = Object.create(User.prototype);
		return Object.assign(user, data);
	}

	public serialize(): SerializedUser {
		return {
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName,
		};
	}
}
