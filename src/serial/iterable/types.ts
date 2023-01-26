import { Serializable } from '../decorators';
import SerialSymbol from '../serial-symbol';
import { Serialized, SerialPrimitive } from '../types';

export const enum IteratorMessageType {
	Next = 'NXT',
	Return = 'RTN',
	Throw = 'TRW',
}
export type SerialIterType<T extends Serializable = Serializable> = T | [SerialPrimitive, T];
export type ReviveIterType<S extends Serialized = Serialized> = S | [SerialPrimitive, S];

export type AsyncReviveIterator<RI extends ReviveIterType = ReviveIterType> = AsyncIterator<RI>;
export type AnySerialIterator<SI extends SerialIterType = SerialIterType> = AsyncIterator<SI> | Iterator<SI>;

export interface ToSerialIterator {
	[SerialSymbol.toSerialIterator]: boolean;
}

export interface AsyncSerialIterator<SI extends SerialIterType = SerialIterType>
	extends AsyncIterableIterator<SI>,
		ToSerialIterator {}
