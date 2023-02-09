export interface SerializedUser {
	email: string;
	firstName: string;
	lastName: string;
	totalOrders: number;
	priAddress: SerializedAddress;
	addresses: SerializedAddress[];
}

export interface SerializedAddress {
	id: string;
	street: string;
	city: string;
	state: string;
	zip: number;
}

export interface SerializedOrder {
	orderId: string;
	user: SerializedUser;
	address: SerializedAddress;
	products: SerializedProduct[];
}

export interface SerializedProduct {
	productId: string;
	productName: string;
}

export interface SerializedCircle {
	color: 'Red' | 'Green' | 'Blue';
	circle: SerializedCircle;
}

export const UserClass = Symbol('Class.User');
export const AddressClass = Symbol('Class.Address');
export const ProductClass = Symbol('Class.Product');
export const OrderClass = Symbol('Class.Order');
export const CircleClass = Symbol('Class.CircleClass');

export const SerializeDecoratorTestObjectClass = Symbol('Class.SerializeDecoratorTestObject');
