import SerializableTransferHandler from './SerializableTransferHandler';
import IterableTransferHandler from './IterableTransferHandler';
import LazyTransferHandler from './lazy-transfer-handler';
export { TransferHandlerRegistration, SerialTransferHandlerEnum as SerialTransferHandlers } from './types';

// create new transfer handlers
export const serializableTransferHandler = new SerializableTransferHandler();
export const iterableTransferHandler = new IterableTransferHandler();
export const lazyTransferHandler = new LazyTransferHandler();
