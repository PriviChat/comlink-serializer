import { jest, expect, test } from '@jest/globals';
import SerializeDecoratorTestObject from '@test-fixtures/serialize-decorator-test-object';
import Order from '@test-fixtures/order';
import User from '@test-fixtures/user';
import Circle from '@test-fixtures/circle';
import { AddressClass, CircleClass, ProductClass, UserClass } from '@test-fixtures/types';
import { isSerializableObject } from '../serial/decorators/utils';
import { makeObj } from './fixtures';
import SerialSymbol from '../serial/serial-symbol';

describe('Serialize descriptor tests', () => {
	test('Check that SerializeDecoratorTestObject has proper descriptors', () => {
		const sds = new SerializeDecoratorTestObject();

		if (isSerializableObject(sds)) {
			const desc = sds[SerialSymbol.serializeDescriptor]();

			/* Serializable Object */

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

			/* Array of Serializable Objects */

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

			/* Set of Serializable Objects */

			// @Serialize(AddressClass)
			expect(desc['proxyFalseSet']).toBeDefined();
			expect(desc['proxyFalseSet'].prop).toBe('proxyFalseSet');
			expect(desc['proxyFalseSet'].type).toBe('Set');
			expect(desc['proxyFalseSet'].classToken).toBe(AddressClass);
			expect(desc['proxyFalseSet'].proxy).toBeFalsy();

			// @Serialize({ classToken: AddressClass, proxy: false })
			expect(desc['proxySetFalseSet']).toBeDefined();
			expect(desc['proxySetFalseSet'].prop).toBe('proxySetFalseSet');
			expect(desc['proxySetFalseSet'].type).toBe('Set');
			expect(desc['proxySetFalseSet'].classToken).toBe(AddressClass);
			expect(desc['proxySetFalseSet'].proxy).toBeFalsy();

			// @Serialize({ classToken: AddressClass, proxy: true })
			expect(desc['proxySetTrueSet']).toBeDefined();
			expect(desc['proxySetTrueSet'].prop).toBe('proxySetTrueSet');
			expect(desc['proxySetTrueSet'].type).toBe('Set');
			expect(desc['proxySetTrueSet'].classToken).toBe(AddressClass);
			expect(desc['proxySetTrueSet'].proxy).toBeTruthy();

			/* Map of Serializable Objects */

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
			expect(desc['priAddress'].proxy).toBeFalsy();
			expect(desc['priAddress'].classToken).toBe(AddressClass);

			expect(desc['addressArr']).toBeDefined();
			expect(desc['addressArr'].prop).toBe('addressArr');
			expect(desc['addressArr'].type).toBe('Array');
			expect(desc['addressArr'].proxy).toBeFalsy();
			expect(desc['addressArr'].classToken).toBe(AddressClass);

			expect(desc['addressArrProxy']).toBeDefined();
			expect(desc['addressArrProxy'].prop).toBe('addressArrProxy');
			expect(desc['addressArrProxy'].type).toBe('Array');
			expect(desc['addressArrProxy'].proxy).toBeTruthy();
			expect(desc['addressArrProxy'].classToken).toBe(AddressClass);
		}
	});

	test('Check that Order has proper descriptors', () => {
		const order0 = makeObj<Order>('order', 0);

		if (isSerializableObject(order0)) {
			const desc = order0[SerialSymbol.serializeDescriptor]();
			expect(desc['user']).toBeDefined();
			expect(desc['user'].prop).toBe('user');
			expect(desc['user'].type).toBe('Serializable');
			expect(desc['user'].proxy).toBeFalsy();
			expect(desc['user'].classToken).toBe(UserClass);
			expect(desc['user'].classToken).toBeTruthy();

			expect(desc['userProxy']).toBeDefined();
			expect(desc['userProxy'].prop).toBe('userProxy');
			expect(desc['userProxy'].type).toBe('Serializable');
			expect(desc['userProxy'].proxy).toBeTruthy();
			expect(desc['userProxy'].classToken).toBe(UserClass);
			expect(desc['userProxy'].classToken).toBeTruthy();

			expect(desc['address']).toBeDefined();
			expect(desc['address'].prop).toBe('address');
			expect(desc['address'].type).toBe('Serializable');
			expect(desc['address'].proxy).toBeFalsy();
			expect(desc['address'].classToken).toBe(AddressClass);

			expect(desc['addressProxy']).toBeDefined();
			expect(desc['addressProxy'].prop).toBe('addressProxy');
			expect(desc['addressProxy'].type).toBe('Serializable');
			expect(desc['addressProxy'].proxy).toBeTruthy();
			expect(desc['addressProxy'].classToken).toBe(AddressClass);

			expect(desc['productArr']).toBeDefined();
			expect(desc['productArr'].prop).toBe('productArr');
			expect(desc['productArr'].type).toBe('Array');
			expect(desc['productArr'].proxy).toBeFalsy();
			expect(desc['productArr'].classToken).toBe(ProductClass);

			expect(desc['productSet']).toBeDefined();
			expect(desc['productSet'].prop).toBe('productSet');
			expect(desc['productSet'].type).toBe('Set');
			expect(desc['productSet'].proxy).toBeFalsy();
			expect(desc['productSet'].classToken).toBe(ProductClass);

			expect(desc['productSetProxy']).toBeDefined();
			expect(desc['productSetProxy'].prop).toBe('productSetProxy');
			expect(desc['productSetProxy'].type).toBe('Set');
			expect(desc['productSetProxy'].proxy).toBeTruthy();
			expect(desc['productSetProxy'].classToken).toBe(ProductClass);
		}
	});

	test('Check that Circle has proper descriptors', () => {
		const circle = new Circle('Green');

		if (isSerializableObject(circle)) {
			const desc = circle[SerialSymbol.serializeDescriptor]();
			expect(desc['circle']).toBeDefined();
			expect(desc['circle'].prop).toBe('circle');
			expect(desc['circle'].type).toBe('Serializable');
			expect(desc['circle'].proxy).toBeFalsy();
			expect(desc['circle'].classToken).toBe(CircleClass);
		}
	});
});
