import { Serialized } from '../..';

export interface SerializedUser extends Serialized {
	email: string;
	firstName: string;
	lastName: string;
}

export interface SerializedOrder extends Serialized {
	orderId: string;
	user: SerializedUser;
}

export interface SerializedProduct extends Serialized {
	productId: string;
	productName: string;
}
