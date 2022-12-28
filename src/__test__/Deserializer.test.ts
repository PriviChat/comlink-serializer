import { expect, test, jest } from '@jest/globals';
import User from '@test-fixtures/User';
import { SerializedOrder, SerializedProduct, SerializedUser } from '@test-fixtures/types';
import { SerialArray, SerialMap, Deserializer, _$ } from '@comlink-serializer';
import { SerializedArray, SerializedMap } from '../serialobjs/types';
import Product from '@test-fixtures/Product';
import Order from '@test-fixtures/Order';
import IdMap from '@test-fixtures/IdMap';

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

describe('Deserializer', () => {
	beforeEach(() => {
		SerialArray;
		User;
		Product;
		Order;
		user0 = {
			[_$.SerialSymbol.registryId]: IdMap.User,
			email: 'john.smith-0@email.com',
			firstName: 'John',
			lastName: 'Smith',
			totalOrders: 0,
		};
		user1 = {
			[_$.SerialSymbol.registryId]: IdMap.User,
			email: 'john.smith-1@email.com',
			firstName: 'John',
			lastName: 'Smith',
			totalOrders: 1,
		};
		user2 = {
			[_$.SerialSymbol.registryId]: IdMap.User,
			email: 'john.smith-2@email.com',
			firstName: 'John',
			lastName: 'Smith',
			totalOrders: 2,
		};
		prod0 = {
			[_$.SerialSymbol.registryId]: IdMap.Product,
			productId: 'DO00',
			productName: 'Doorbell',
		};
		prod1 = {
			[_$.SerialSymbol.registryId]: IdMap.Product,
			productId: 'FL01',
			productName: 'Flashlight',
		};
		prod2 = {
			[_$.SerialSymbol.registryId]: IdMap.Product,
			productId: 'RU02',
			productName: "Rubik's Cube",
		};
		order0 = {
			[_$.SerialSymbol.registryId]: IdMap.Order,
			orderId: 'ORDER0',
			user: user0,
			products: [prod0, prod1, prod2],
		};
		userArray = {
			[_$.SerialSymbol.registryId]: IdMap.SerialArray,
			_array: [user0, user1, user2],
		};
		productArray = {
			[_$.SerialSymbol.registryId]: IdMap.SerialArray,
			_array: [prod0, prod1, prod2],
		};
		userMap = {
			[_$.SerialSymbol.registryId]: IdMap.SerialMap,
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
		expect((user as any)[_$.SerialSymbol.registryId]).toBeDefined();
		expect(user.email).toEqual(user0.email);
		expect(user.firstName).toEqual(user0.firstName);
		expect(user.lastName).toEqual(user0.lastName);
	});

	test('Flat Object Auto Deserialize', () => {
		const prod = deserializer.deserialize(prod0) as Product;
		expect((prod as any).isSerializable).toBeTruthy();
		expect((prod as any)[_$.SerialSymbol.registryId]).toBeDefined();
		expect(prod.productId).toEqual(prod0.productId);
		expect(prod.productName).toEqual(prod0.productName);
	});

	test('Nested Object Deserialize', () => {
		const order = deserializer.deserialize(order0) as Order;
		expect((order as any).isSerializable).toBeTruthy();
		expect((order as any)[_$.SerialSymbol.registryId]).toBeDefined();
		expect(order.orderId).toEqual(order0.orderId);

		const user = order.user;
		expect(user.email).toEqual(user0.email);
		expect((user as any).isSerializable).toBeTruthy();
		expect((user as any)[_$.SerialSymbol.registryId]).toBeDefined();

		expect(order.products.length).toEqual(3);
		const products = order.products;
		expect((products[0] as any).isSerializable).toBeTruthy();
		expect((products[0] as any)[_$.SerialSymbol.registryId]).toBeDefined();
		expect(products[0].productId).toEqual(prod0.productId);
		expect(products[0].productName).toEqual(prod0.productName);
		expect((products[1] as any).isSerializable).toBeTruthy();
		expect((products[1] as any)[_$.SerialSymbol.registryId]).toBeDefined();
		expect(products[1].productId).toEqual(prod1.productId);
		expect(products[1].productName).toEqual(prod1.productName);
		expect((products[2] as any).isSerializable).toBeTruthy();
		expect((products[2] as any)[_$.SerialSymbol.registryId]).toBeDefined();
		expect(products[2].productId).toEqual(prod2.productId);
		expect(products[2].productName).toEqual(prod2.productName);
	});

	/* test('Array Object Manual Deserialize', () => {
		const users = deserializer.deserialize(userArray) as SerialArray<User>;
		expect((users as any).isSerializable).toBeTruthy();
		expect(users).toBeInstanceOf(SerialArray);
		expect((users as any)[_$.SerialSymbol.registryId]).toBeDefined();
		expect((users[0] as any).isSerializable).toBeTruthy();
		expect(users[0].email).toEqual(user0.email);
		expect(users[0].firstName).toEqual(user0.firstName);
		expect(users[0].lastName).toEqual(user0.lastName);
	});

	test('Array Object Auto Deserialize', () => {
		const prods = deserializer.deserialize(productArray) as SerialArray<Product>;
		expect((prods as any).isSerializable).toBeTruthy();
		expect(prods).toBeInstanceOf(SerialArray);
		expect((prods as any)[_$.SerialSymbol.registryId]).toBeDefined();
		expect((prods[0] as any).isSerializable).toBeTruthy();
		expect(prods[0].productId).toEqual(prod0.productId);
		expect(prods[0].productName).toEqual(prod0.productName);
	});

	test('Map Object Deserialize', () => {
		const users = deserializer.deserialize(userMap) as SerialMap<string, User>;
		expect((users as any).isSerializable).toBeTruthy();
		expect(users).toBeInstanceOf(SerialMap);
		expect((users as any)[_$.SerialSymbol.registryId]).toBeDefined();
		expect(users.get('0')?.email).toEqual(user0.email);
		expect(users.get('0')?.firstName).toEqual(user0.firstName);
		expect(users.get('0')?.lastName).toEqual(user0.lastName);
	}); */

	test('Deserialize error handling', () => {
		const foo = {};
		expect(() => {
			deserializer.deserialize(foo);
		}).toThrow();

		const foo2 = {
			[_$.SerialSymbol.registryId]: 'bar',
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
