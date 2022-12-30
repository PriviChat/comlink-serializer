import { Serializable } from '../decorators';

export const enum IteratorMessageType {
	RegistryId = 'RID',
	Next = 'NXT',
	Return = 'RTN',
	Throw = 'TRW',
}

export type SerialIterable<T extends Serializable = Serializable> = AsyncIterable<T> | Iterable<T>;
export type AsyncSerialIterable<T extends Serializable = Serializable> = AsyncIterableIterator<T>;
