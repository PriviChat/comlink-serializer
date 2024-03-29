import { expect, test } from '@jest/globals';
import User from '@test-fixtures/user';
import { SerializedUser, UserClass } from '@test-fixtures/types';

import SerialSymbol from '../../serial/serial-symbol';
import { SerializedArray, Serializer } from '../../serial';
import { makeObj } from '../fixtures';
import { makeSerial } from '../../serial/utils';
import { getSerializedMeta } from '@test-fixtures/utils';

describe('SerialArray Tests', () => {
	let serializer: Serializer;

	beforeEach(() => {
		//must create a new serializer before each
		serializer = new Serializer();
	});

	afterEach(() => {
		// close the message ports
		serializer.destroy();
	});

	test('Serialize array contents', () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const userArr0 = [user0, user1];

		const hash0 = getSerializedMeta(serializer.serialize<SerializedUser>(user0)).hash;
		const hash1 = getSerializedMeta(serializer.serialize<SerializedUser>(user1)).hash;

		const serializedArr = serializer.serialize<SerializedArray<SerializedUser>>(makeSerial(userArr0));

		const arrMeta = getSerializedMeta(serializedArr);
		expect(arrMeta.classToken).toEqual(SerialSymbol.serialArray.toString());
		expect(arrMeta.hash).toBeDefined();

		const serUser0 = serializedArr['ComSer.array'][0] as SerializedUser;
		const serUserMeta0 = getSerializedMeta(serUser0);
		expect(serUserMeta0.classToken).toBe(UserClass.toString());
		expect(serUserMeta0.hash).toBe(hash0);
		expect(serUser0.email).toBe(user0.email);
		expect(serUser0.firstName).toBe(user0.firstName);
		expect(serUser0.lastName).toBe(user0.lastName);
		expect(serUser0.totalOrders).toBe(user0.totalOrders);

		const serUser1 = serializedArr['ComSer.array'][1] as SerializedUser;
		const serUserMeta1 = getSerializedMeta(serUser1);
		expect(serUserMeta1.classToken).toBe(UserClass.toString());
		expect(serUserMeta1.hash).toBe(hash1);
		expect(serUser1.email).toBe(user1.email);
		expect(serUser1.firstName).toBe(user1.firstName);
		expect(serUser1.lastName).toBe(user1.lastName);
		expect(serUser1.totalOrders).toBe(user1.totalOrders);
	});
});
