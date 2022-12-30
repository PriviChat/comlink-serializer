import { expect, test, jest } from '@jest/globals';
import User from '@test-fixtures/User';
import { SerializedOrder, SerializedProduct, SerializedUser } from '@test-fixtures/types';
import { SerialArray, Deserializer } from '@comlink-serializer';
import { SerialSymbol, SerializedMap, SerializedArray, symDes } from '@comlink-serializer-internal';
import Product from '@test-fixtures/Product';
import Order from '@test-fixtures/Order';
import { SymClassMap, SymRegIdMap } from '@test-fixtures/SymMap';

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
			[symDes(SerialSymbol.registryId)]: SymRegIdMap.User,
			[symDes(SerialSymbol.class)]: 'User',
			email: 'john.smith-0@email.com',
			firstName: 'John',
			lastName: 'Smith',
			totalOrders: 0,
		};
		user1 = {
			[symDes(SerialSymbol.registryId)]: SymRegIdMap.User,
			[symDes(SerialSymbol.class)]: 'User',
			email: 'john.smith-1@email.com',
			firstName: 'John',
			lastName: 'Smith',
			totalOrders: 1,
		};
		user2 = {
			[symDes(SerialSymbol.registryId)]: SymRegIdMap.User,
			[symDes(SerialSymbol.class)]: 'User',
			email: 'john.smith-2@email.com',
			firstName: 'John',
			lastName: 'Smith',
			totalOrders: 2,
		};
		prod0 = {
			[symDes(SerialSymbol.registryId)]: SymRegIdMap.Product,
			[symDes(SerialSymbol.class)]: 'Product',
			productId: 'DO00',
			productName: 'Doorbell',
		};
		prod1 = {
			[symDes(SerialSymbol.registryId)]: SymRegIdMap.Product,
			[symDes(SerialSymbol.class)]: 'Product',
			productId: 'FL01',
			productName: 'Flashlight',
		};
		prod2 = {
			[symDes(SerialSymbol.registryId)]: SymRegIdMap.Product,
			[symDes(SerialSymbol.class)]: 'Product',
			productId: 'RU02',
			productName: "Rubik's Cube",
		};
		order0 = {
			[symDes(SerialSymbol.registryId)]: SymRegIdMap.Order,
			[symDes(SerialSymbol.class)]: 'Order',
			orderId: 'ORDER0',
			user: user0,
			products: [prod0, prod1, prod2],
		};
		userArray = {
			[symDes(SerialSymbol.registryId)]: SymRegIdMap.SerialArray,
			_array: [user0, user1, user2],
		};
		productArray = {
			[symDes(SerialSymbol.registryId)]: SymRegIdMap.SerialArray,
			_array: [prod0, prod1, prod2],
		};
		userMap = {
			[symDes(SerialSymbol.registryId)]: SymRegIdMap.SerialMap,
			_map: new Map([
				['0', user0],
				['1', user1],
				['2', user2],
			]),
		};
	});

	test('Flat object manual deserialize', () => {
		const user = deserializer.deserialize(user0) as User;
		expect(SerialSymbol.serializable in user).toBeTruthy();
		expect(SerialSymbol.registryId in user).toBeTruthy();
		expect((user as any)[SerialSymbol.registryId]).toEqual(SymRegIdMap.User);
		expect(SerialSymbol.class in user).toBeTruthy();
		expect((user as any)[SerialSymbol.class]).toEqual(SymClassMap.User);
		expect(user.email).toEqual(user0.email);
		expect(user.firstName).toEqual(user0.firstName);
		expect(user.lastName).toEqual(user0.lastName);
	});

	test('Flat object auto deserialize', () => {
		const prod = deserializer.deserialize(prod0) as Product;
		expect(SerialSymbol.serializable in prod).toBeTruthy();
		expect(SerialSymbol.registryId in prod).toBeTruthy();
		expect((prod as any)[SerialSymbol.registryId]).toEqual(SymRegIdMap.Product);
		expect(SerialSymbol.class in prod).toBeTruthy();
		expect((prod as any)[SerialSymbol.class]).toEqual(SymClassMap.Product);
		expect(prod.productId).toEqual(prod0.productId);
		expect(prod.productName).toEqual(prod0.productName);
	});

	test('Nested object deserialize', () => {
		const order = deserializer.deserialize(order0) as Order;
		expect(order.orderId).toEqual(order0.orderId);

		const user = order.user;
		expect(SerialSymbol.serializable in user).toBeTruthy();
		expect(SerialSymbol.registryId in user).toBeTruthy();
		expect((user as any)[SerialSymbol.registryId]).toEqual(SymRegIdMap.User);
		expect(SerialSymbol.class in user).toBeTruthy();
		expect((user as any)[SerialSymbol.class]).toEqual(SymClassMap.User);
		expect(user.email).toEqual(user0.email);
		expect(user.firstName).toEqual(user0.firstName);
		expect(user.lastName).toEqual(user0.lastName);

		expect(order.products.length).toEqual(3);
		const products = order.products;

		const prodObj0 = products[0];
		expect(SerialSymbol.serializable in prodObj0).toBeTruthy();
		expect((prodObj0 as any)[SerialSymbol.registryId]).toEqual(SymRegIdMap.Product);
		expect((prodObj0 as any)[SerialSymbol.class]).toEqual(SymClassMap.Product);
		expect(prodObj0.productId).toEqual(prod0.productId);
		expect(prodObj0.productName).toEqual(prod0.productName);

		const prodObj1 = products[1];
		expect(SerialSymbol.serializable in prodObj1).toBeTruthy();
		expect((prodObj1 as any)[SerialSymbol.registryId]).toEqual(SymRegIdMap.Product);
		expect((prodObj1 as any)[SerialSymbol.class]).toEqual(SymClassMap.Product);
		expect(prodObj1.productId).toEqual(prod1.productId);
		expect(prodObj1.productName).toEqual(prod1.productName);

		const prodObj2 = products[2];
		expect(SerialSymbol.serializable in prodObj2).toBeTruthy();
		expect((prodObj2 as any)[SerialSymbol.registryId]).toEqual(SymRegIdMap.Product);
		expect((prodObj2 as any)[SerialSymbol.class]).toEqual(SymClassMap.Product);
		expect(prodObj2.productId).toEqual(prod2.productId);
		expect(prodObj2.productName).toEqual(prod2.productName);
	});

	test('Deserialize error handling empty object', () => {
		const foo = {};
		expect(() => {
			deserializer.deserialize(foo);
		}).toThrow();
	});

	test('Deserialize error handling invalid registryId', () => {
		const error = jest.spyOn(console, 'error').mockImplementation(() => {});
		(user0['ComSer.registryId'] = 'foo'),
			expect(() => {
				deserializer.deserialize(user0);
			}).toThrow();
		expect(error.mock.calls).toHaveLength(1);
		error.mockReset();
	});

	test('Deserialize error handling no class', () => {
		const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
		user0['ComSer.class'] = '';
		deserializer.deserialize(user0);
		expect(warn.mock.calls).toHaveLength(1);
		warn.mockReset();
	});
});
