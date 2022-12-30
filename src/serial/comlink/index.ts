import SerializableTransferHandler from './SerializableTransferHandler';
import IterableTransferHandler from './IterableTransferHandler';
import { Deserializer } from '..';
import { SerialIterable, SerializableIterable } from '../iterators';
import { Serializable } from '../decorators';
export { TransferHandlerRegistration, SerialTransferHandlers } from './types';

// create new transfer handlers
export const serializableTransferHandler = new SerializableTransferHandler(new Deserializer());
export const iterableTransferHandler = new IterableTransferHandler(new Deserializer());

/**
 * It takes an iterable and returns an iterator
 * @param {SerializableIterable} iterable - The iterable to wrap.
 * @returns A SerializableIterator object.
 */
export function serialIterable<T extends Serializable>(iterable: SerialIterable<T>) {
	return new SerializableIterable<T>(iterable);
}
