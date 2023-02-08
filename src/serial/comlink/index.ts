import SerializableTransferHandler from './serializable-transfer-handler';
export { TransferHandlerRegistration, SerialTransferHandlerEnum as SerialTransferHandlers } from './types';

// create new transfer handlers
export const serializableTransferHandler = new SerializableTransferHandler();
