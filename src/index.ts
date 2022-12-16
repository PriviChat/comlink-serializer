import * as Comlink from 'comlink';
import objectRegistry from './registry';
import transferHandler from './serial/comlink';
import { TransferHandlerRegistration } from './serial/comlink';
import { Serialized } from './serial';
import { Serializable, Deserializable } from './serial/decorators';
import { SerializableArray, SerializableMap } from './serialobjs';

function registerTransferHandler(config: TransferHandlerRegistration) {
	//Declare these so that the decorators get called (and the classes registered in the registry)
	new SerializableArray();
	new SerializableMap();

	Comlink.transferHandlers.set('SerializableObject', transferHandler.getHandler());
}

const _$ = {
	transferHandler,
	objectRegistry,
};

const ComlinkSerializer = {
	registerTransferHandler,
};

export { _$ };
export { Serialized, Serializable, Deserializable, SerializableArray, SerializableMap, TransferHandlerRegistration };
export default ComlinkSerializer;
