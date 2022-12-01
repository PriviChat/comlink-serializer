import * as Comlink from 'comlink';
import { Deserializer } from '../Deserializer';
import { Serializable } from '..';
import { Serialized } from '../types';
import { AnyConstructor } from '../mixin/types';
import { SerializableArray, SerializableMap } from '../../serialobjs';

/* Global Handlers */

export interface TransferHandlerConfig {
	transferClasses: AnyConstructor<Serializable>[];
}

export function registerTransferHandler(config: TransferHandlerConfig) {
	//Declare these so that the decorators get called (and the classes registered in the registry)
	SerializableArray;
	SerializableMap;

	Comlink.transferHandlers.set('SerializableObject', serializableObjectTransferHandler);
}

export const serializableObjectTransferHandler: Comlink.TransferHandler<Serializable, Serialized> = {
	// We want to use this transfer handler for any objects that have the serializable mixin
	canHandle: function (value: any): value is Serializable {
		return value?.isSerializable ?? false;
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
