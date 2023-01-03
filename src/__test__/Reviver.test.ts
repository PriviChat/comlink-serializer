import { expect, test, jest } from '@jest/globals';
import hash from 'object-hash';
import User from '@test-fixtures/User';
import { Reviver } from '@comlink-serializer';
import { SerialSymbol } from '@comlink-serializer-internal';
import Product from '@test-fixtures/Product';
import Order from '@test-fixtures/Order';
import { SymClassMap, SymRegIdMap } from '@test-fixtures/SymMap';
import { getSerializableSymbol } from '@test-fixtures/utils';

describe('Reviver', () => {
	let reviver: Reviver;
	let user0: User;
	let user1: User;
	let user2: User;
	let prod0: Product;
	let prod1: Product;
	let prod2: Product;
	let order0: Order;
	let userArr0: Array<User>;
	let prodArr0: Array<Product>;
	let userMap0: Map<string, User>;

	beforeEach(() => {
		//must create a new reviver before each
		reviver = new Reviver();

		user0 = new User('john.smith@email.com_0', 'John_0', 'Smith_0', 0);
		user1 = new User('john.smith@email.com_1', 'John_1', 'Smith_1', 1);
		user2 = new User('john.smith@email.com_2', 'John_2', 'Smith_2', 2);

		prod0 = new Product('DOBL_0', 'Doorbell_0');
		prod1 = new Product('DOBL_1', 'Doorbell_1');
		prod2 = new Product('DOBL_2', 'Doorbell_2');

		order0 = new Order('ORDR_0', user0, [prod0, prod1, prod2]);

		userArr0 = [user0, user1, user2];

		prodArr0 = [prod0, prod1, prod2];

		userMap0 = new Map(
			new Map([
				['0', user0],
				['1', user1],
				['2', user2],
			])
		);
	});

	test('Flat object manual revive', () => {
		const user = reviver.revive<User>(user0.serialize(), true);
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

	test('Flat object auto revive', () => {
		const prod = reviver.revive<Product>(prod0.serialize(), true);
		expect(SerialSymbol.serializable in prod).toBeTruthy();
		const meta = getSerializableSymbol(prod);
		expect(meta).toBeDefined();
		expect(meta?.rid).toEqual(SymRegIdMap.Product);
		expect(meta?.cln).toEqual(SymClassMap.Product);
		expect(meta?.hsh).toBeUndefined();
		expect(prod.productId).toEqual(prod0.productId);
		expect(prod.productName).toEqual(prod0.productName);
	});

	test('Nested object revive', () => {
		const order = reviver.revive<Order>(order0.serialize(), true);
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

	test('Reviver error handling empty object', () => {
		const foo = {};
		expect(() => {
			reviver.revive(foo);
		}).toThrow();
	});

	test('Reviver error handling missing rid', () => {
		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		(user0 as any)[SerialSymbol.serializable] = () => {
			return {
				rid: '',
				cln: SymClassMap.User,
				hsh: hash(user0),
			};
		};
		expect(() => {
			reviver.revive(user0.serialize(), true);
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});

	test('Reviver error handling invalid rid', () => {
		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		(user0 as any)[SerialSymbol.serializable] = () => {
			return {
				rid: 'foo',
				cln: SymClassMap.User,
				hsh: hash(user0),
			};
		};
		expect(() => {
			reviver.revive(user0.serialize(), true);
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});

	test('Reviver error handling no hsh', () => {
		const err = jest.spyOn(console, 'error').mockImplementation(() => {});
		(user0 as any)[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.User,
				cln: SymClassMap.User,
				hsh: '',
			};
		};
		expect(() => {
			reviver.revive(user0.serialize(), true);
		}).toThrow();
		expect(err.mock.calls).toHaveLength(1);
		err.mockReset();
	});

	test('Reviver warn handling no class', () => {
		const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
		(user0 as any)[SerialSymbol.serializable] = () => {
			return {
				rid: SymRegIdMap.User,
				cln: '',
				hsh: hash(user0),
			};
		};
		reviver.revive(user0.serialize(), true);
		expect(warn.mock.calls).toHaveLength(1);
		warn.mockReset();
	});
});
