import { Serializable } from '../decorators';
import SerialSymbol from '../serial-symbol';
import { Serialized, SerialPrimitive } from '../types';
import SerialIterable from './serial-iterable';

export const enum IteratorMessageType {
	RegistryId = 'RID',
	Next = 'NXT',
	Return = 'RTN',
	Throw = 'TRW',
}
export type SerialIterType<T extends Serializable> = T | [SerialPrimitive, T];
export type ReviveIterType<S extends Serialized> = S | [SerialPrimitive, S];

export type AsyncReviveIterator<S extends Serialized = Serialized> = AsyncIterator<ReviveIterType<S>>;
export type AnySerialIterator<T extends Serializable = Serializable> =
	| AsyncIterator<SerialIterType<T>>
	| Iterator<SerialIterType<T>>;

export interface SerialIterableWrap<
	S extends Serialized = Serialized,
	T extends Serializable<S> = Serializable<S>,
	I = SerialIterType<T>
> extends AsyncIterableIterator<I> {
	[SerialSymbol.serialIterableWrap](): boolean;
	get serialIterable(): SerialIterable<S, T>;
}
