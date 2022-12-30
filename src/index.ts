import * as Comlink from 'comlink';

import { serialIterable, serializableTransferHandler, iterableTransferHandler } from './serial/comlink';
import { TransferHandlerRegistration, SerialTransferHandlers } from './serial/comlink';
import { Serialized, Deserializer } from './serial';
import { Serializable, Deserializable } from './serial/decorators';
import { AsyncSerialIterable } from './serial/iterators';
import { SerialArray, SerialMap } from './serialobjs';

function registerTransferHandler(reg: TransferHandlerRegistration) {
	//Declare these so that the decorators get called (and the classes registered in the registry)
	new SerialArray();
	new SerialMap();

	Comlink.transferHandlers.set(SerialTransferHandlers.SerializableTransferHandler, serializableTransferHandler.handler);
	Comlink.transferHandlers.set(SerialTransferHandlers.IterableTransferHandler, iterableTransferHandler.handler);
}

const ComlinkSerializer = {
	registerTransferHandler,
	serialIterable,
};

export {
	Serialized,
	Serializable,
	Deserializable,
	Deserializer,
	AsyncSerialIterable,
	serialIterable,
	SerialArray,
	SerialMap,
	TransferHandlerRegistration,
};
export default ComlinkSerializer;
