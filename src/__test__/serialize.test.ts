import { jest, expect, test } from '@jest/globals';
import SerializeDecoratorSettings from '@test-fixtures/serialize-decorator-settings';
import Order from '@test-fixtures/order';
import User from '@test-fixtures/user';
import { AddressClass, ProductClass, UserClass } from '@test-fixtures/types';
import { isSerializableObject } from '../serial/decorators/utils';
import { makeObj } from './fixtures';
import SerialSymbol from '../serial/serial-symbol';

describe('Serialize descriptor tests', () => {
	test('Check that SerializeDecoratorSettings has proper descriptors', () => {
		const sds = new SerializeDecoratorSettings();

		if (isSerializableObject(sds)) {
			const desc = sds[SerialSymbol.serializeDescriptor]();
			// @Serialize()
			expect(desc['lazyFalseObject']).toBeDefined();
			expect(desc['lazyFalseObject'].prop).toEqual('lazyFalseObject');
			expect(desc['lazyFalseObject'].type).toEqual('Serializable');
			expect(desc['lazyFalseObject'].token).toEqual(AddressClass.toString());
			expect(desc['lazyFalseObject'].lazy).toBeFalsy();

			// @Serialize(false)
			expect(desc['lazyBoolFalseObject']).toBeDefined();
			expect(desc['lazyBoolFalseObject'].prop).toEqual('lazyBoolFalseObject');
			expect(desc['lazyBoolFalseObject'].type).toEqual('Serializable');
			expect(desc['lazyBoolFalseObject'].token).toEqual(AddressClass.toString());
			expect(desc['lazyBoolFalseObject'].lazy).toBeFalsy();

			// @Serialize(true)
			expect(desc['lazyBoolTrueObject']).toBeDefined();
			expect(desc['lazyBoolTrueObject'].prop).toEqual('lazyBoolTrueObject');
			expect(desc['lazyBoolTrueObject'].type).toEqual('Serializable');
			expect(desc['lazyBoolTrueObject'].token).toEqual(AddressClass.toString());
			expect(desc['lazyBoolTrueObject'].lazy).toBeTruthy();

			// @Serialize({ lazy: true })
			expect(desc['lazySettTrueObject']).toBeDefined();
			expect(desc['lazySettTrueObject'].prop).toEqual('lazySettTrueObject');
			expect(desc['lazySettTrueObject'].type).toEqual('Serializable');
			expect(desc['lazySettTrueObject'].token).toEqual(AddressClass.toString());
			expect(desc['lazySettTrueObject'].lazy).toBeTruthy();

			// @Serialize({ lazy: false })
			expect(desc['lazySettFalseObject']).toBeDefined();
			expect(desc['lazySettFalseObject'].prop).toEqual('lazySettFalseObject');
			expect(desc['lazySettFalseObject'].type).toEqual('Serializable');
			expect(desc['lazySettFalseObject'].token).toEqual(AddressClass.toString());
			expect(desc['lazySettFalseObject'].lazy).toBeFalsy();

			// @Serialize(AddressClass)
			expect(desc['lazyFalseArray']).toBeDefined();
			expect(desc['lazyFalseArray'].prop).toEqual('lazyFalseArray');
			expect(desc['lazyFalseArray'].type).toEqual('Array');
			expect(desc['lazyFalseArray'].token).toEqual(AddressClass.toString());
			expect(desc['lazyFalseArray'].lazy).toBeFalsy();

			// @Serialize({ classToken: AddressClass, lazy: false })
			expect(desc['lazySettFalseArray']).toBeDefined();
			expect(desc['lazySettFalseArray'].prop).toEqual('lazySettFalseArray');
			expect(desc['lazySettFalseArray'].type).toEqual('Array');
			expect(desc['lazySettFalseArray'].token).toEqual(AddressClass.toString());
			expect(desc['lazySettFalseArray'].lazy).toBeFalsy();

			// @Serialize({ classToken: AddressClass, lazy: true })
			expect(desc['lazySettTrueArray']).toBeDefined();
			expect(desc['lazySettTrueArray'].prop).toEqual('lazySettTrueArray');
			expect(desc['lazySettTrueArray'].type).toEqual('Array');
			expect(desc['lazySettTrueArray'].token).toEqual(AddressClass.toString());
			expect(desc['lazySettTrueArray'].lazy).toBeTruthy();

			// @Serialize(AddressClass)
			expect(desc['lazyFalseMap']).toBeDefined();
			expect(desc['lazyFalseMap'].prop).toEqual('lazyFalseMap');
			expect(desc['lazyFalseMap'].type).toEqual('Map');
			expect(desc['lazyFalseMap'].token).toEqual(AddressClass.toString());
			expect(desc['lazyFalseMap'].lazy).toBeFalsy();

			// @Serialize({ classToken: AddressClass, lazy: false })
			expect(desc['lazySettFalseMap']).toBeDefined();
			expect(desc['lazySettFalseMap'].prop).toEqual('lazySettFalseMap');
			expect(desc['lazySettFalseMap'].type).toEqual('Map');
			expect(desc['lazySettFalseMap'].token).toEqual(AddressClass.toString());
			expect(desc['lazySettFalseMap'].lazy).toBeFalsy();

			// @Serialize({ classToken: AddressClass, lazy: true })
			expect(desc['lazySettTrueMap']).toBeDefined();
			expect(desc['lazySettTrueMap'].prop).toEqual('lazySettTrueMap');
			expect(desc['lazySettTrueMap'].type).toEqual('Map');
			expect(desc['lazySettTrueMap'].token).toEqual(AddressClass.toString());
			expect(desc['lazySettTrueMap'].lazy).toBeTruthy();
		}
	});

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
			expect(desc['user'].token).toBeTruthy();

			expect(desc['products']).toBeDefined();
			expect(desc['products'].prop).toEqual('products');
			expect(desc['products'].type).toEqual('Array');
			expect(desc['products'].token).toEqual(ProductClass);
		}
	});
});
