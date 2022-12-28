import * as Comlink from 'comlink';
import objectRegistry from './registry';
import { serializableTransferHandler } from './serial/comlink';
import { iterableTransferHandler } from './serial/comlink';
import { TransferHandlerRegistration } from './serial/comlink';
import { Serialized, Deserializer, SerialSymbol } from './serial';
import { Serializable, Deserializable } from './serial/decorators';
import { SerializeIterator } from './serial/iterators';
import { SerialArray, SerialMap } from './serialobjs';

function registerTransferHandler(reg: TransferHandlerRegistration) {
	//Declare these so that the decorators get called (and the classes registered in the registry)
	new SerialArray();
	new SerialMap();

	Comlink.transferHandlers.set('ComlinkSerializer.SerializableTransferHandler', serializableTransferHandler.handler);
	Comlink.transferHandlers.set('ComlinkSerializer.IterableTransferHandler', iterableTransferHandler.handler);
}

const _$ = {
	serializableTransferHandler,
	iterableTransferHandler,
	objectRegistry,
	SerialSymbol,
	SerializeIterator,
};

const ComlinkSerializer = {
	registerTransferHandler,
};

export { _$ };
export { Serialized, Serializable, Deserializable, Deserializer, SerialArray, SerialMap, TransferHandlerRegistration };
export default ComlinkSerializer;
