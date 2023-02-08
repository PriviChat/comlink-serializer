import * as Comlink from 'comlink';
import { hashCd, toSerial, toSerialProxy } from './serial/utils';
import { serializableTransferHandler, SerialTransferHandlers, TransferHandlerRegistration } from './serial/comlink';
import { Serialized, ReviverCtx, SerializeCtx } from './serial';

import { Serializable, Serialize } from './serial/decorators';
import { toSerialIterator } from './serial/iterable/utils';
import objectRegistry, { defaultRegistryObjects } from './registry';

defaultRegistryObjects.forEach((entry) => {
	objectRegistry.register({
		class: entry.class,
		classToken: entry.classToken,
		constructor: entry.constructor,
	});
});

export function registerTransferHandler(reg: TransferHandlerRegistration) {
	Comlink.transferHandlers.set(SerialTransferHandlers.SerializableTransferHandler, serializableTransferHandler.handler);
}

const ComlinkSerializer = {
	registerTransferHandler,
	toSerial,
	toSerialProxy,
	toSerialIterator,
};

export {
	Serialized,
	Serializable,
	Serialize,
	ReviverCtx,
	SerializeCtx,
	toSerial,
	toSerialProxy,
	toSerialIterator,
	TransferHandlerRegistration,
	hashCd,
};
export default ComlinkSerializer;
