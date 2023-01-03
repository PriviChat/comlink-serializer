import SerializableTransferHandler from './SerializableTransferHandler';
import IterableTransferHandler from './IterableTransferHandler';
export { TransferHandlerRegistration, SerialTransferHandlers } from './types';

// create new transfer handlers
export const serializableTransferHandler = new SerializableTransferHandler();
export const iterableTransferHandler = new IterableTransferHandler();
