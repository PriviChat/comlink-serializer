import * as Comlink from 'comlink';
import objectRegistry from './registry';
import { Deserializer as deserializer } from './serial/Deserializer';
import { serializableObjectTransferHandler, TransferHandlerRegistration } from './serial/comlink';
import Serializable, { Serialized } from './serial/mixin';
import { SerializableArray, SerializableMap } from './serialobjs';

function registerTransferHandler(config: TransferHandlerRegistration) {
	//Declare these so that the decorators get called (and the classes registered in the registry)
	new SerializableArray();
	new SerializableMap();

	Comlink.transferHandlers.set('SerializableObject', serializableObjectTransferHandler);
}

const _$ = {
	serializableObjectTransferHandler,
	objectRegistry,
	deserializer,
};

const ComlinkSerializer = {
	registerTransferHandler,
	Serializable,
};

export { _$ };
export { Serializable, Serialized, SerializableArray, SerializableMap, TransferHandlerRegistration };
export default ComlinkSerializer;
