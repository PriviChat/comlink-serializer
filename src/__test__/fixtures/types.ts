import { Serialized } from '@comlink-serializer';

export interface SerializedUser extends Serialized {
	email: string;
	firstName: string;
	lastName: string;
	totalOrders: number;
}

export interface SerializedOrder extends Serialized {
	orderId: string;
	user: SerializedUser;
	products: SerializedProduct[];
}

export interface SerializedProduct extends Serialized {
	productId: string;
	productName: string;
}
