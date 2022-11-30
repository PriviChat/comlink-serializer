import * as Comlink from 'comlink';
import { Deserializer } from '../Deserializer';
import { Serializable } from '../mixin';
import { Serialized } from '../types';

/* Global Handlers */

export const serializableObjectTransferHandler: Comlink.TransferHandler<Serializable, Serialized> = {
	// We want to use this transfer handler for any objects that have the serializable mixin
	canHandle: function (value: any): value is Serializable {
		return value?.isSerializable;
	},
	serialize: (object) => {
		// Convert the UserId to string for transfer
		const serialized = object.serialize();
		return [serialized, []];
	},
	deserialize: (object) => {
		const deserialized = Deserializer.deserialize(object);
		return deserialized;
	},
};
