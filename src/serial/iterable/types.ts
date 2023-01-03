import { Serializable } from '../decorators';
import { Serialized, SerialPrimitive } from '../types';

export const enum IteratorMessageType {
	RegistryId = 'RID',
	Next = 'NXT',
	Return = 'RTN',
	Throw = 'TRW',
}

export type AnySerialIterable<T extends Serializable = Serializable> = SerialIterable<T> | AsyncSerialIterable<T>;
export type SerialIterable<T extends Serializable> =
	| Iterable<T>
	| IterableIterator<T>
	| Array<T>
	| Map<SerialPrimitive, T>;
export type AsyncSerialIterable<T extends Serializable> = AsyncIterable<T> | AsyncIterableIterator<T>;
export type AsyncReviverIterable<S extends Serialized> = AsyncIterable<S>;
