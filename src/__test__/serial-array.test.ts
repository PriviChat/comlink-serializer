import { expect, test } from '@jest/globals';
import User from '@test-fixtures/user';
import { SerializedUser, UserClass } from '@test-fixtures/types';

import { SerialArray, SerializedArray, Serializer } from '../serial';
import { makeObj } from './fixtures';
import SerialSymbol from '../serial/serial-symbol';
import { makeSerial } from '../serial/utils';

describe('SerialArray Tests', () => {
	let serializer: Serializer;

	beforeEach(() => {
		//must create a new serializer before each
		serializer = new Serializer();
	});

	test('Array serializes contents', () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const userArr0 = [user0, user1];
		const serializedArr = serializer.serialize<SerializedArray<SerializedUser>>(makeSerial(userArr0));

		const arrMeta = serializedArr[SerialSymbol.serialized];
		expect(arrMeta).toBeDefined();
		expect(arrMeta?.classToken).toEqual(SerialArray.classToken.toString());
		expect(arrMeta?.hash).toBeDefined();

		const serUser0 = serializedArr['ComSer.array'][0] as SerializedUser;
		const serUser0Meta = serUser0[SerialSymbol.serialized];
		expect(serUser0Meta).toBeDefined();
		expect(serUser0Meta?.classToken).toEqual(UserClass.toString());
		expect(serUser0Meta?.hash).toBeDefined();
		expect(serUser0.email).toEqual(user0.email);
		expect(serUser0.firstName).toEqual(user0.firstName);
		expect(serUser0.lastName).toEqual(user0.lastName);
		expect(serUser0.totalOrders).toEqual(user0.totalOrders);

		const serUser1 = serializedArr['ComSer.array'][1] as SerializedUser;
		const serUser1Meta = serUser1[SerialSymbol.serialized];
		expect(serUser1Meta).toBeDefined();
		expect(serUser1Meta?.classToken).toEqual(UserClass.toString());
		expect(serUser1Meta?.hash).toBeDefined();
		expect(serUser1.email).toEqual(user1.email);
		expect(serUser1.firstName).toEqual(user1.firstName);
		expect(serUser1.lastName).toEqual(user1.lastName);
		expect(serUser1.totalOrders).toEqual(user1.totalOrders);
	});
});
