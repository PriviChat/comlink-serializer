import { expect, test, jest } from '@jest/globals';
import User from '@test-fixtures/User';
import { SerializedOrder, SerializedProduct, SerializedUser } from '@test-fixtures/types';
import { SerializableArray, SerializableMap, Deserializer } from '@comlink-serializer';
import { SerializedArray, SerializedMap } from '../../serialobjs/types';
import Product from '@test-fixtures/Product';
import Order from '@test-fixtures/Order';

const deserializer = new Deserializer();
let user0: SerializedUser;
let user1: SerializedUser;
let user2: SerializedUser;
let prod0: SerializedProduct;
let prod1: SerializedProduct;
let prod2: SerializedProduct;
let order0: SerializedOrder;
let userArray: SerializedArray;
let productArray: SerializedArray;
let userMap: SerializedMap;
let userMap2: SerializedMap;
const USER_SCLASS = 'e45b5b10-1097-5d39-92d5-f66521e79e39'; // User __$SCLASS
const PRODUCT_SCLASS = '1d3ec51a-ce5f-5ea7-b3a0-5adb08c88e5d'; // Product __$SCLASS
const ORDER_SCLASS = '391c515c-fcec-597a-b671-9a65a1eac821'; // Order __$SCLASS
const ARRAY_SCLASS = '0fc6729c-e75f-521f-8ad6-657a78494fd6'; // SerializableArray __$SCLASS
const MAP_SCLASS = 'a2341794-4348-5080-a350-624f81126bf6'; // SerializableMap __$SCLASS

describe('Deserializer', () => {
	beforeEach(() => {
		SerializableArray;
		User;
		Product;
		Order;
		user0 = {
			__$SCLASS: USER_SCLASS,
			email: 'john.smith-0@email.com',
			firstName: 'John',
			lastName: 'Smith',
		};
		user1 = {
			__$SCLASS: USER_SCLASS,
			email: 'john.smith-1@email.com',
			firstName: 'John',
			lastName: 'Smith',
		};
		user2 = {
			__$SCLASS: USER_SCLASS,
			email: 'john.smith-2@email.com',
			firstName: 'John',
			lastName: 'Smith',
		};
		prod0 = {
			__$SCLASS: PRODUCT_SCLASS,
			productId: 'DO00',
			productName: 'Doorbell',
		};
		prod1 = {
			__$SCLASS: PRODUCT_SCLASS,
			productId: 'FL01',
			productName: 'Flashlight',
		};
		prod2 = {
			__$SCLASS: PRODUCT_SCLASS,
			productId: 'RU02',
			productName: "Rubik's Cube",
		};
		order0 = {
			__$SCLASS: ORDER_SCLASS,
			orderId: 'ORDER0',
			user: user0,
			products: [prod0, prod1, prod2],
		};
		userArray = {
			__$SCLASS: ARRAY_SCLASS,
			_array: [user0, user1, user2],
		};
		productArray = {
			__$SCLASS: ARRAY_SCLASS,
			_array: [prod0, prod1, prod2],
		};
		userMap = {
			__$SCLASS: MAP_SCLASS,
			_map: new Map([
				['0', user0],
				['1', user1],
				['2', user2],
			]),
		};
	});

	test('Flat Object Manual Deserialize', () => {
		const user = deserializer.deserialize(user0) as User;
		expect((user as any).isSerializable).toBeTruthy();
		expect((user as any).__$SCLASS).toBeDefined();
		expect(user.email).toEqual(user0.email);
		expect(user.firstName).toEqual(user0.firstName);
		expect(user.lastName).toEqual(user0.lastName);
	});

	test('Flat Object Auto Deserialize', () => {
		const prod = deserializer.deserialize(prod0) as Product;
		expect((prod as any).isSerializable).toBeTruthy();
		expect((prod as any).__$SCLASS).toBeDefined();
		expect(prod.productId).toEqual(prod0.productId);
		expect(prod.productName).toEqual(prod0.productName);
	});

	test('Nested Object Deserialize', () => {
		const order = deserializer.deserialize(order0) as Order;
		expect((order as any).isSerializable).toBeTruthy();
		expect((order as any).__$SCLASS).toBeDefined();
		expect(order.orderId).toEqual(order0.orderId);

		const user = order.user;
		expect(user.email).toEqual(user0.email);
		expect((user as any).isSerializable).toBeTruthy();
		expect((user as any).__$SCLASS).toBeDefined();

		expect(order.products.length).toEqual(3);
		const products = order.products;
		expect((products[0] as any).isSerializable).toBeTruthy();
		expect((products[0] as any).__$SCLASS).toBeDefined();
		expect(products[0].productId).toEqual(prod0.productId);
		expect(products[0].productName).toEqual(prod0.productName);
		expect((products[1] as any).isSerializable).toBeTruthy();
		expect((products[1] as any).__$SCLASS).toBeDefined();
		expect(products[1].productId).toEqual(prod1.productId);
		expect(products[1].productName).toEqual(prod1.productName);
		expect((products[2] as any).isSerializable).toBeTruthy();
		expect((products[2] as any).__$SCLASS).toBeDefined();
		expect(products[2].productId).toEqual(prod2.productId);
		expect(products[2].productName).toEqual(prod2.productName);
	});

	test('Array Object Manual Deserialize', () => {
		const users = deserializer.deserialize(userArray) as SerializableArray<User>;
		expect((users as any).isSerializable).toBeTruthy();
		expect(users).toBeInstanceOf(SerializableArray);
		expect((users as any).__$SCLASS).toBeDefined();
		expect((users[0] as any).isSerializable).toBeTruthy();
		expect(users[0].email).toEqual(user0.email);
		expect(users[0].firstName).toEqual(user0.firstName);
		expect(users[0].lastName).toEqual(user0.lastName);
	});

	test('Array Object Auto Deserialize', () => {
		const prods = deserializer.deserialize(productArray) as SerializableArray<Product>;
		expect((prods as any).isSerializable).toBeTruthy();
		expect(prods).toBeInstanceOf(SerializableArray);
		expect((prods as any).__$SCLASS).toBeDefined();
		expect((prods[0] as any).isSerializable).toBeTruthy();
		expect(prods[0].productId).toEqual(prod0.productId);
		expect(prods[0].productName).toEqual(prod0.productName);
	});

	test('Map Object Deserialize', () => {
		const users = deserializer.deserialize(userMap) as SerializableMap<string, User>;
		expect((users as any).isSerializable).toBeTruthy();
		expect(users).toBeInstanceOf(SerializableMap);
		expect((users as any).__$SCLASS).toBeDefined();
		expect(users.get('0')?.email).toEqual(user0.email);
		expect(users.get('0')?.firstName).toEqual(user0.firstName);
		expect(users.get('0')?.lastName).toEqual(user0.lastName);
	});

	test('Deserialize error handling', () => {
		const foo = {};
		expect(() => {
			deserializer.deserialize(foo);
		}).toThrow();

		const foo2 = {
			__$SCLASS: 'bar',
		};

		const origError = console.error;
		console.error = jest.fn();
		expect(() => {
			deserializer.deserialize(foo2);
		}).toThrow();
		expect(console.error).toHaveBeenCalled();
		console.error = origError;
	});
});
