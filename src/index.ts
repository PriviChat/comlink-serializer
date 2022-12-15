import * as Comlink from 'comlink';
import objectRegistry from './registry';
import { serializableObjectTransferHandler, TransferHandlerRegistration } from './serial/comlink';
import { Deserializer, Serialized } from './serial';
import { Serializable } from './serial/decorators';
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
};

const ComlinkSerializer = {
	registerTransferHandler,
	Serializable,
};

export { _$ };
export { Serializable, Serialized, Deserializer, SerializableArray, SerializableMap, TransferHandlerRegistration };
export default ComlinkSerializer;
