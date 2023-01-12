import * as Comlink from 'comlink';
import { hashCd } from './serial/utils';
import {
	iterableTransferHandler,
	serializableTransferHandler,
	lazyTransferHandler,
	SerialTransferHandlers,
	TransferHandlerRegistration,
} from './serial/comlink';
import { Serialized, Reviver, toSerialObject, toSerialIterable, lazy } from './serial';
import { Serializable, Serialize } from './serial/decorators';
import { AsyncSerialIterable } from './serial/iterable';
import objectRegistry, { defaultRegistryObjects } from './registry';
import { SerialArray, SerialMap } from './serialobjs';

defaultRegistryObjects.forEach((entry) => {
	objectRegistry.register({
		classToken: entry.classToken,
		constructor: entry.constructor,
	});
});

export function registerTransferHandler(reg: TransferHandlerRegistration) {
	new SerialArray();
	new SerialMap();
	Comlink.transferHandlers.set(SerialTransferHandlers.SerializableTransferHandler, serializableTransferHandler.handler);
	Comlink.transferHandlers.set(SerialTransferHandlers.IterableTransferHandler, iterableTransferHandler.handler);
	Comlink.transferHandlers.set(SerialTransferHandlers.LazyTransferHandler, lazyTransferHandler.handler);
}

const ComlinkSerializer = {
	registerTransferHandler,
	toSerialObject,
	lazy,
};

export {
	Serialized,
	Serializable,
	Serialize,
	Reviver,
	AsyncSerialIterable,
	toSerialObject,
	toSerialIterable,
	lazy,
	TransferHandlerRegistration,
	hashCd,
};
export default ComlinkSerializer;
