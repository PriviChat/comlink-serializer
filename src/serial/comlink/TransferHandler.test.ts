import { jest, expect, test } from '@jest/globals';
import { User, SerializedUser } from '../../../test';
import { serializableObjectTransferHandler } from './TransferHandler';
import Serializable, { Serialized } from '../mixin';
import { Deserializer } from '../Deserializer';

type SerializeFn<T> = () => T;
type DeserializeFn = (serialObj: Serialized) => Serializable<Serialized>;

describe('handler unit tests', () => {
	test('canHandle checks isSerializable', () => {
		const handler = serializableObjectTransferHandler;
		expect(handler.canHandle(undefined)).toBe(false);
		expect(handler.canHandle(null)).toBe(false);
		expect(handler.canHandle({})).toBe(false);
		expect(handler.canHandle({ isSerializable: false })).toBe(false);
		expect(handler.canHandle({ isSerializable: true })).toBe(true);
	});

	test('serialize calls serialize()', () => {
		const handler = serializableObjectTransferHandler;
		const user = new User('foo@example.org', 'Bob', 'Smith');

		user.serialize = jest.fn<SerializeFn<SerializedUser>>();
		handler.serialize(user);

		expect(user.serialize).toHaveBeenCalled();
	});

	test('deserialize calls static deserialize()', () => {
		const handler = serializableObjectTransferHandler;
		const user = new User('foo@example.org', 'Bob', 'Smith');

		const originalDeserialize = Deserializer.deserialize;
		Deserializer.deserialize = jest.fn<DeserializeFn>();
		const serialized = handler.serialize(user)[0];
		handler.deserialize(serialized);

		expect(Deserializer.deserialize).toHaveBeenCalled();

		Deserializer.deserialize = originalDeserialize;
	});

	test('deserialize throws exception when object is not Serialized', () => {
		const handler = serializableObjectTransferHandler;
		expect(() => {
			handler.deserialize({});
		}).toThrow();
	});
});
