import { expect, test } from '@jest/globals';
import User from '@test-fixtures/user';
import { SerializedUser, UserClass } from '@test-fixtures/types';

import SerialSymbol from '../serial/serial-symbol';
import { SerializedSet, Serializer } from '../serial';
import { makeObj } from './fixtures';
import { makeSerial } from '../serial/utils';
import { getSerializedMeta } from '@test-fixtures/utils';

describe('SerialSet Tests', () => {
	let serializer: Serializer;

	beforeEach(() => {
		//must create a new serializer before each
		serializer = new Serializer();
	});

	afterEach(() => {
		// close the message ports
		serializer.destroy();
	});

	test('Serialize set contents', () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const userSet0 = new Set([user0, user1]);

		const hash0 = getSerializedMeta(serializer.serialize<SerializedUser>(user0)).hash;
		const hash1 = getSerializedMeta(serializer.serialize<SerializedUser>(user1)).hash;

		const serializedSet = serializer.serialize<SerializedSet<SerializedUser>>(makeSerial(userSet0));

		const arrMeta = getSerializedMeta(serializedSet);
		expect(arrMeta.classToken).toEqual(SerialSymbol.serialSet.toString());
		expect(arrMeta.hash).toBeDefined();

		const serUser0 = serializedSet['ComSer.set'][0] as SerializedUser;
		const serUserMeta0 = getSerializedMeta(serUser0);
		expect(serUserMeta0.classToken).toBe(UserClass.toString());
		expect(serUserMeta0.hash).toBe(hash0);
		expect(serUser0.email).toBe(user0.email);
		expect(serUser0.firstName).toBe(user0.firstName);
		expect(serUser0.lastName).toBe(user0.lastName);
		expect(serUser0.totalOrders).toBe(user0.totalOrders);

		const serUser1 = serializedSet['ComSer.set'][1] as SerializedUser;
		const serUserMeta1 = getSerializedMeta(serUser1);
		expect(serUserMeta1.classToken).toBe(UserClass.toString());
		expect(serUserMeta1.hash).toBe(hash1);
		expect(serUser1.email).toBe(user1.email);
		expect(serUser1.firstName).toBe(user1.firstName);
		expect(serUser1.lastName).toBe(user1.lastName);
		expect(serUser1.totalOrders).toBe(user1.totalOrders);
	});
});
