import { expect, test } from '@jest/globals';
import User from '@test-fixtures/user';
import { SerializedUser, UserClass } from '@test-fixtures/types';

import SerialSymbol from '../serial/serial-symbol';
import { SerializedMap, SerializedSet, Serializer } from '../serial';
import { makeObj } from './fixtures';
import { makeSerial } from '../serial/utils';
import { getSerializedMeta } from '@test-fixtures/utils';

describe('SerialMap Tests', () => {
	let serializer: Serializer;

	beforeEach(() => {
		//must create a new serializer before each
		serializer = new Serializer();
	});

	afterEach(() => {
		// close the message ports
		serializer.destroy();
	});

	test('Serialize map contents', () => {
		const user0 = makeObj<User>('user', 0);
		const user1 = makeObj<User>('user', 1);
		const userMap0 = new Map([
			[0, user0],
			[1, user1],
		]);

		const hash0 = getSerializedMeta(serializer.serialize<SerializedUser>(user0)).hash;
		const hash1 = getSerializedMeta(serializer.serialize<SerializedUser>(user1)).hash;

		const serializedMap = serializer.serialize<SerializedMap<SerializedUser>>(makeSerial(userMap0));

		const arrMeta = getSerializedMeta(serializedMap);
		expect(arrMeta.classToken).toBe(SerialSymbol.serialMap.toString());
		expect(arrMeta.hash).toBeDefined();

		expect(serializedMap['ComSer.size']).toBe(2);
		expect(serializedMap['ComSer.keyType']).toBe('number');

		expect(serializedMap['ComSer.map'][0]['0']).toBe('0');
		const serUser0 = serializedMap['ComSer.map'][0]['1'] as SerializedUser;
		const serUserMeta0 = getSerializedMeta(serUser0);
		expect(serUserMeta0.classToken).toBe(UserClass.toString());
		expect(serUserMeta0.hash).toBe(hash0);
		expect(serUser0.email).toBe(user0.email);
		expect(serUser0.firstName).toBe(user0.firstName);
		expect(serUser0.lastName).toBe(user0.lastName);
		expect(serUser0.totalOrders).toBe(user0.totalOrders);

		expect(serializedMap['ComSer.map'][1]['0']).toBe('1');
		const serUser1 = serializedMap['ComSer.map'][1]['1'] as SerializedUser;
		const serUserMeta1 = getSerializedMeta(serUser1);
		expect(serUserMeta1.classToken).toBe(UserClass.toString());
		expect(serUserMeta1.hash).toBe(hash1);
		expect(serUser1.email).toBe(user1.email);
		expect(serUser1.firstName).toBe(user1.firstName);
		expect(serUser1.lastName).toBe(user1.lastName);
		expect(serUser1.totalOrders).toBe(user1.totalOrders);
	});
});
