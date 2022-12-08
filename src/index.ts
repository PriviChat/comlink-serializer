import * as Comlink from 'comlink';
import { serializableObjectTransferHandler, type TransferHandlerRegistration } from './serial/comlink';
import Serializable, { type Serialized } from './serial/mixin';
import { SerializableArray, SerializableMap } from './serialobjs';

function registerTransferHandler(config: TransferHandlerRegistration) {
	//Declare these so that the decorators get called (and the classes registered in the registry)
	SerializableArray;
	SerializableMap;
	Comlink.transferHandlers.set('SerializableObject', serializableObjectTransferHandler);
}

const ComlinkSerializer = {
	registerTransferHandler,
	Serializable,
};

export { Serializable, Serialized, SerializableArray, SerializableMap, TransferHandlerRegistration };
export default ComlinkSerializer;
