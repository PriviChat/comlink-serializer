import * as Comlink from 'comlink';
import { hashCd, serialize, serializeLazy } from './serial/utils';
import {
	iterableTransferHandler,
	serializableTransferHandler,
	lazyTransferHandler,
	SerialTransferHandlers,
	TransferHandlerRegistration,
} from './serial/comlink';
import { Serialized, ReviverCtx, SerializeCtx } from './serial';

import { Serializable, Serialize } from './serial/decorators';
import { serializeIterator } from './serial/iterable/utils';
import objectRegistry, { defaultRegistryObjects } from './registry';

defaultRegistryObjects.forEach((entry) => {
	objectRegistry.register({
		classToken: entry.classToken,
		constructor: entry.constructor,
	});
});

export function registerTransferHandler(reg: TransferHandlerRegistration) {
	Comlink.transferHandlers.set(SerialTransferHandlers.SerializableTransferHandler, serializableTransferHandler.handler);
	Comlink.transferHandlers.set(SerialTransferHandlers.IterableTransferHandler, iterableTransferHandler.handler);
	Comlink.transferHandlers.set(SerialTransferHandlers.LazyTransferHandler, lazyTransferHandler.handler);
}

const ComlinkSerializer = {
	registerTransferHandler,
	serialize,
	serializeLazy,
};

export {
	Serialized,
	Serializable,
	Serialize,
	ReviverCtx,
	SerializeCtx,
	serialize,
	serializeLazy,
	serializeIterator,
	TransferHandlerRegistration,
	hashCd,
};
export default ComlinkSerializer;
