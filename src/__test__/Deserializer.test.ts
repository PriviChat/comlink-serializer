import { expect, test, jest } from '@jest/globals';
import hash from 'object-hash';
import User from '@test-fixtures/User';
import { SerializedOrder, SerializedProduct, SerializedUser } from '@test-fixtures/types';
import { SerialArray, Deserializer } from '@comlink-serializer';
import { SerialSymbol, SerializedMap, SerializedArray } from '@comlink-serializer-internal';
import Product from '@test-fixtures/Product';
import Order from '@test-fixtures/Order';
import { SymClassMap, SymRegIdMap } from '@test-fixtures/SymMap';
import { getSerializableSymbol } from '@test-fixtures/utils';

const deserializer = new Deserializer();
let user0: SerializedUser;
let user1: SerializedUser;
let user2: SerializedUser;
let prod0: SerializedProduct;
let prod1: SerializedProduct;
let prod2: SerializedProduct;
let order0: SerializedOrder;
let userArr0: SerializedArray;
let prodArr0: SerializedArray;
let userMap0: SerializedMap;

describe('Deserializer', () => {
	beforeEach(() => {
		SerialArray;
		User;
		Product;
		Order;

		user0 = {
			email: 'john.smith@email.com_0',
			firstName: 'John_0',
			lastName: 'Smith_0',
			totalOrders: 0,
		};
		user0[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.User,
				cln: SymClassMap.User,
				hsh: hash(user0),
			};
		};

		user1 = {
			email: 'john.smith@email.com_1',
			firstName: 'John_1',
			lastName: 'Smith_1',
			totalOrders: 1,
		};
		user1[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.User,
				cln: SymClassMap.User,
				hsh: hash(user1),
			};
		};

		user2 = {
			email: 'john.smith@email.com_2',
			firstName: 'John_2',
			lastName: 'Smith_2',
			totalOrders: 2,
		};
		user2[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.User,
				cln: SymClassMap.User,
				hsh: hash(user2),
			};
		};

		prod0 = {
			productId: 'DOBL_0',
			productName: 'Doorbell_0',
		};
		prod0[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.Product,
				cln: SymClassMap.Product,
				hsh: hash(prod0),
			};
		};

		prod1 = {
			productId: 'DOBL_1',
			productName: 'Doorbell_1',
		};
		prod1[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.Product,
				cln: SymClassMap.Product,
				hsh: hash(prod1),
			};
		};

		prod2 = {
			productId: 'DOBL_2',
			productName: 'Doorbell_2',
		};
		prod2[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.Product,
				cln: SymClassMap.Product,
				hsh: hash(prod2),
			};
		};

		order0 = {
			orderId: 'ORDR_0',
			user: user0,
			products: [prod0, prod1, prod2],
		};
		order0[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.Order,
				cln: SymClassMap.Order,
				hsh: hash(order0),
			};
		};

		userArr0 = {
			_array: [user0, user1, user2],
		};
		userArr0[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.SerialArray,
				cln: SymClassMap.SerialArray,
				hsh: hash(userArr0),
			};
		};

		prodArr0 = {
			_array: [prod0, prod1, prod2],
		};
		prodArr0[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.SerialArray,
				cln: SymClassMap.SerialArray,
				hsh: hash(prodArr0),
			};
		};

		userMap0 = {
			_map: new Map([
				['0', user0],
				['1', user1],
				['2', user2],
			]),
		};
		userMap0[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.SerialMap,
				cln: SymClassMap.SerialMap,
				hsh: hash(userMap0),
			};
		};
	});

	test('Flat object manual deserialize', () => {
		const user = deserializer.deserialize<User>(user0);
		expect(SerialSymbol.serializable in user).toBeTruthy();
		const meta = getSerializableSymbol(user);
		expect(meta).toBeDefined();
		expect(meta?.rid).toEqual(SymRegIdMap.User);
		expect(meta?.cln).toEqual(SymClassMap.User);
		expect(meta?.hsh).toBeUndefined();
		expect(user.email).toEqual(user0.email);
		expect(user.firstName).toEqual(user0.firstName);
		expect(user.lastName).toEqual(user0.lastName);
	});

	test('Flat object auto deserialize', () => {
		const prod = deserializer.deserialize<Product>(prod0);
		expect(SerialSymbol.serializable in prod).toBeTruthy();
		const meta = getSerializableSymbol(prod);
		expect(meta).toBeDefined();
		expect(meta?.rid).toEqual(SymRegIdMap.Product);
		expect(meta?.cln).toEqual(SymClassMap.Product);
		expect(meta?.hsh).toBeUndefined();
		expect(prod.productId).toEqual(prod0.productId);
		expect(prod.productName).toEqual(prod0.productName);
	});

	test('Nested object deserialize', () => {
		const order = deserializer.deserialize<Order>(order0);
		expect(order.orderId).toEqual(order0.orderId);

		const user = order.user;
		expect(SerialSymbol.serializable in user).toBeTruthy();
		const userMeta = getSerializableSymbol(user);
		expect(userMeta).toBeDefined();
		expect(userMeta?.rid).toEqual(SymRegIdMap.User);
		expect(userMeta?.cln).toEqual(SymClassMap.User);
		expect(userMeta?.hsh).toBeUndefined();
		expect(user.email).toEqual(user0.email);
		expect(user.firstName).toEqual(user0.firstName);
		expect(user.lastName).toEqual(user0.lastName);

		expect(order.products.length).toEqual(3);
		const products = order.products;

		const prodObj0 = products[0];
		expect(SerialSymbol.serializable in prodObj0).toBeTruthy();
		const prod0Meta = getSerializableSymbol(prodObj0);
		expect(prod0Meta).toBeDefined();
		expect(prod0Meta?.rid).toEqual(SymRegIdMap.Product);
		expect(prod0Meta?.cln).toEqual(SymClassMap.Product);
		expect(prod0Meta?.hsh).toBeUndefined();
		expect(prodObj0.productId).toEqual(prod0.productId);
		expect(prodObj0.productName).toEqual(prod0.productName);

		const prodObj1 = products[1];
		expect(SerialSymbol.serializable in prodObj1).toBeTruthy();
		const prod1Meta = getSerializableSymbol(prodObj1);
		expect(prod1Meta).toBeDefined();
		expect(prod1Meta?.rid).toEqual(SymRegIdMap.Product);
		expect(prod1Meta?.cln).toEqual(SymClassMap.Product);
		expect(prod1Meta?.hsh).toBeUndefined();
		expect(prodObj1.productId).toEqual(prod1.productId);
		expect(prodObj1.productName).toEqual(prod1.productName);

		const prodObj2 = products[2];
		expect(SerialSymbol.serializable in prodObj2).toBeTruthy();
		const prod2Meta = getSerializableSymbol(prodObj2);
		expect(prod2Meta).toBeDefined();
		expect(prod2Meta?.rid).toEqual(SymRegIdMap.Product);
		expect(prod2Meta?.cln).toEqual(SymClassMap.Product);
		expect(prod2Meta?.hsh).toBeUndefined();
		expect(prodObj2.productId).toEqual(prod2.productId);
		expect(prodObj2.productName).toEqual(prod2.productName);
	});

	test('Deserialize error handling empty object', () => {
		const foo = {};
		expect(() => {
			deserializer.deserialize(foo);
		}).toThrow();
	});

	test('Deserialize error handling missing rid', () => {
		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		user0[SerialSymbol.serializable] = () => {
			return {
				rid: '',
				cln: SymClassMap.User,
				hsh: hash(user0),
			};
		};
		expect(() => {
			deserializer.deserialize(user0);
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});

	test('Deserialize error handling invalid rid', () => {
		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		user0[SerialSymbol.serializable] = () => {
			return {
				rid: 'foo',
				cln: SymClassMap.User,
				hsh: hash(user0),
			};
		};
		expect(() => {
			deserializer.deserialize(user0);
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});

	test('Deserialize error handling no hsh', () => {
		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		user0[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.User,
				cln: SymClassMap.User,
				hsh: '',
			};
		};
		expect(() => {
			deserializer.deserialize(user0);
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});

	test('Deserialize warn handling no class', () => {
		const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
		user0[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.User,
				cln: '',
				hsh: hash(user0),
			};
		};
		deserializer.deserialize(user0);
		expect(warn.mock.calls).toHaveLength(1);
		warn.mockReset();
	});
});
