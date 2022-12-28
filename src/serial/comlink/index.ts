import SerializableTransferHandler from './SerializableTransferHandler';
import IterableTransferHandler from './IterableTransferHandler';
import { Deserializer } from '..';
export { TransferHandlerRegistration } from './types';
export const serializableTransferHandler = new SerializableTransferHandler(new Deserializer());
export const iterableTransferHandler = new IterableTransferHandler();
