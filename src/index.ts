import * as Comlink from 'comlink';
import stringHash from 'string-hash';
import {
	iterableTransferHandler,
	serializableTransferHandler,
	SerialTransferHandlers,
	TransferHandlerRegistration,
} from './serial/comlink';
import { Serialized, Reviver, toSerialObject, toSerialIterable } from './serial';
import { Serializable } from './serial/decorators';
import { AsyncSerialIterable } from './serial/iterable';
import objectRegistry, { defaultRegistryObjects } from './registry';
import { SerialArray, SerialMap } from './serialobjs';

defaultRegistryObjects.forEach((entry) => {
	objectRegistry.register({
		name: entry.name,
		id: entry.id,
		constructor: entry.constructor,
	});
});

export function registerTransferHandler(reg: TransferHandlerRegistration) {
	new SerialArray();
	new SerialMap();
	Comlink.transferHandlers.set(SerialTransferHandlers.SerializableTransferHandler, serializableTransferHandler.handler);
	Comlink.transferHandlers.set(SerialTransferHandlers.IterableTransferHandler, iterableTransferHandler.handler);
}

const ComlinkSerializer = {
	registerTransferHandler,
	toSerialObject,
};

export {
	Serialized,
	Serializable,
	Reviver,
	AsyncSerialIterable,
	toSerialObject,
	toSerialIterable,
	TransferHandlerRegistration,
	stringHash as hash,
};
export default ComlinkSerializer;
