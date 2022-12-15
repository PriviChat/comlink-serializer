import * as Comlink from 'comlink';
import { Deserializer } from '..';
import { Serializable } from '../decorators';
import { Serialized } from '../types';

const deserializer = new Deserializer();

/* Global Handlers */
export const serializableObjectTransferHandler: Comlink.TransferHandler<Serializable, Serialized> = {
	// We want to use this transfer handler for any objects that have the serializable mixin
	canHandle: function (value: any): value is Serializable {
		return value?.isSerializable ?? false;
	},
	serialize: (object: Serializable<Serialized>) => {
		// Convert the UserId to string for transfer
		const serialized = object.serialize();
		return [serialized, []];
	},
	deserialize: (object: Serialized) => {
		const deserialized = deserializer.deserialize(object);
		return deserialized;
	},
};
