export { default as ProxyWrapper } from './proxy-wrapper';
import SerializableTransferHandler from './serializable-transfer-handler';
import IterableTransferHandler from './iterable-transfer-handler';
//import ProxyTransferHandler from './proxy-transfer-handler';
export { TransferHandlerRegistration, SerialTransferHandlerEnum as SerialTransferHandlers } from './types';

// create new transfer handlers
export const serializableTransferHandler = new SerializableTransferHandler();
export const iterableTransferHandler = new IterableTransferHandler();
//export const lazyTransferHandler = new ProxyTransferHandler();
