import { jest, expect, test } from '@jest/globals';
import SerializeDecoratorTestObject from '@test-fixtures/serialize-decorator-test-object';
import Order from '@test-fixtures/order';
import User from '@test-fixtures/user';
import { AddressClass, ProductClass, UserClass } from '@test-fixtures/types';
import { isSerializableObject } from '../serial/decorators/utils';
import { makeObj } from './fixtures';
import SerialSymbol from '../serial/serial-symbol';

describe('Serialize descriptor tests', () => {
	test('Check that SerializeDecoratorTestObject has proper descriptors', () => {
		const sds = new SerializeDecoratorTestObject();

		if (isSerializableObject(sds)) {
			const desc = sds[SerialSymbol.serializeDescriptor]();
			// @Serialize()
			expect(desc['proxyFalseObject']).toBeDefined();
			expect(desc['proxyFalseObject'].prop).toBe('proxyFalseObject');
			expect(desc['proxyFalseObject'].type).toBe('Serializable');
			expect(desc['proxyFalseObject'].classToken).toBe(AddressClass);
			expect(desc['proxyFalseObject'].proxy).toBeFalsy();

			// @Serialize(false)
			expect(desc['proxyBoolFalseObject']).toBeDefined();
			expect(desc['proxyBoolFalseObject'].prop).toBe('proxyBoolFalseObject');
			expect(desc['proxyBoolFalseObject'].type).toBe('Serializable');
			expect(desc['proxyBoolFalseObject'].classToken).toEqual(AddressClass);
			expect(desc['proxyBoolFalseObject'].proxy).toBeFalsy();

			// @Serialize(true)
			expect(desc['proxyBoolTrueObject']).toBeDefined();
			expect(desc['proxyBoolTrueObject'].prop).toBe('proxyBoolTrueObject');
			expect(desc['proxyBoolTrueObject'].type).toBe('Serializable');
			expect(desc['proxyBoolTrueObject'].classToken).toBe(AddressClass);
			expect(desc['proxyBoolTrueObject'].proxy).toBeTruthy();

			// @Serialize({ proxy: true })
			expect(desc['proxySetTrueObject']).toBeDefined();
			expect(desc['proxySetTrueObject'].prop).toBe('proxySetTrueObject');
			expect(desc['proxySetTrueObject'].type).toBe('Serializable');
			expect(desc['proxySetTrueObject'].classToken).toBe(AddressClass);
			expect(desc['proxySetTrueObject'].proxy).toBeTruthy();

			// @Serialize({ proxy: false })
			expect(desc['proxySetFalseObject']).toBeDefined();
			expect(desc['proxySetFalseObject'].prop).toBe('proxySetFalseObject');
			expect(desc['proxySetFalseObject'].type).toBe('Serializable');
			expect(desc['proxySetFalseObject'].classToken).toBe(AddressClass);
			expect(desc['proxySetFalseObject'].proxy).toBeFalsy();

			// @Serialize(AddressClass)
			expect(desc['proxyFalseArray']).toBeDefined();
			expect(desc['proxyFalseArray'].prop).toBe('proxyFalseArray');
			expect(desc['proxyFalseArray'].type).toBe('Array');
			expect(desc['proxyFalseArray'].classToken).toBe(AddressClass);
			expect(desc['proxyFalseArray'].proxy).toBeFalsy();

			// @Serialize({ classToken: AddressClass, proxy: false })
			expect(desc['proxySetFalseArray']).toBeDefined();
			expect(desc['proxySetFalseArray'].prop).toBe('proxySetFalseArray');
			expect(desc['proxySetFalseArray'].type).toBe('Array');
			expect(desc['proxySetFalseArray'].classToken).toBe(AddressClass);
			expect(desc['proxySetFalseArray'].proxy).toBeFalsy();

			// @Serialize({ classToken: AddressClass, proxy: true })
			expect(desc['proxySetTrueArray']).toBeDefined();
			expect(desc['proxySetTrueArray'].prop).toBe('proxySetTrueArray');
			expect(desc['proxySetTrueArray'].type).toBe('Array');
			expect(desc['proxySetTrueArray'].classToken).toBe(AddressClass);
			expect(desc['proxySetTrueArray'].proxy).toBeTruthy();

			// @Serialize(AddressClass)
			expect(desc['proxyFalseMap']).toBeDefined();
			expect(desc['proxyFalseMap'].prop).toBe('proxyFalseMap');
			expect(desc['proxyFalseMap'].type).toBe('Map');
			expect(desc['proxyFalseMap'].classToken).toBe(AddressClass);
			expect(desc['proxyFalseMap'].proxy).toBeFalsy();

			// @Serialize({ classToken: AddressClass, proxy: false })
			expect(desc['proxySetFalseMap']).toBeDefined();
			expect(desc['proxySetFalseMap'].prop).toBe('proxySetFalseMap');
			expect(desc['proxySetFalseMap'].type).toBe('Map');
			expect(desc['proxySetFalseMap'].classToken).toBe(AddressClass);
			expect(desc['proxySetFalseMap'].proxy).toBeFalsy();

			// @Serialize({ classToken: AddressClass, proxy: true })
			expect(desc['proxySetTrueMap']).toBeDefined();
			expect(desc['proxySetTrueMap'].prop).toBe('proxySetTrueMap');
			expect(desc['proxySetTrueMap'].type).toBe('Map');
			expect(desc['proxySetTrueMap'].classToken).toBe(AddressClass);
			expect(desc['proxySetTrueMap'].proxy).toBeTruthy();
		}
	});

	test('Check that User has proper descriptors', () => {
		const user0 = makeObj<User>('user', 0);

		if (isSerializableObject(user0)) {
			const desc = user0[SerialSymbol.serializeDescriptor]();
			expect(desc['priAddress']).toBeDefined();
			expect(desc['priAddress'].prop).toBe('priAddress');
			expect(desc['priAddress'].type).toBe('Serializable');
			expect(desc['priAddress'].classToken).toBe(AddressClass);

			expect(desc['addresses']).toBeDefined();
			expect(desc['addresses'].prop).toBe('addresses');
			expect(desc['addresses'].type).toBe('Array');
			expect(desc['addresses'].classToken).toBe(AddressClass);
		}
	});

	test('Check that Order has proper descriptors', () => {
		const order0 = makeObj<Order>('order', 0);

		if (isSerializableObject(order0)) {
			const desc = order0[SerialSymbol.serializeDescriptor]();
			expect(desc['user']).toBeDefined();
			expect(desc['user'].prop).toBe('user');
			expect(desc['user'].type).toBe('Serializable');
			expect(desc['user'].classToken).toBe(UserClass);
			expect(desc['user'].classToken).toBeTruthy();

			expect(desc['products']).toBeDefined();
			expect(desc['products'].prop).toBe('products');
			expect(desc['products'].type).toBe('Array');
			expect(desc['products'].classToken).toBe(ProductClass);
		}
	});
});
