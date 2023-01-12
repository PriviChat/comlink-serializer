import { jest, expect, test } from '@jest/globals';
import Product from '@test-fixtures/Product';
import Order from '@test-fixtures/Order';
import User from '@test-fixtures/User';
import { AddressClass, ProductClass, UserClass } from '@test-fixtures/types';
import { isSerializableObject } from '../serial/decorators/utils';
import { makeObj } from './fixtures';
import { SerialSymbol } from 'src/serial';

describe('Serialize descriptor tests', () => {
	test('Check that User has proper descriptors', () => {
		const user0 = makeObj<User>('user', 0);

		if (isSerializableObject(user0)) {
			const desc = user0[SerialSymbol.serializeDescriptor]();
			expect(desc['priAddress']).toBeDefined();
			expect(desc['priAddress'].prop).toEqual('priAddress');
			expect(desc['priAddress'].type).toEqual('Serializable');
			expect(desc['priAddress'].token).toEqual(AddressClass.toString());

			expect(desc['addresses']).toBeDefined();
			expect(desc['addresses'].prop).toEqual('addresses');
			expect(desc['addresses'].type).toEqual('Array');
			expect(desc['addresses'].token).toEqual(AddressClass);
		}
	});

	test('Check that Order has proper descriptors', () => {
		const order0 = makeObj<Order>('order', 0);

		if (isSerializableObject(order0)) {
			const desc = order0[SerialSymbol.serializeDescriptor]();
			expect(desc['user']).toBeDefined();
			expect(desc['user'].prop).toEqual('user');
			expect(desc['user'].type).toEqual('Serializable');
			expect(desc['user'].token).toEqual(UserClass.toString());

			expect(desc['products']).toBeDefined();
			expect(desc['products'].prop).toEqual('products');
			expect(desc['products'].type).toEqual('Array');
			expect(desc['products'].token).toEqual(ProductClass);
		}
	});
});
