import { Serializable } from '../decorators';
import { Serialized, SerialPrimitive } from '../types';

export type SerialIterType<T extends Serializable = Serializable> = T | [SerialPrimitive, T];
export type ReviveIterType<S extends Serialized = Serialized> = S | [SerialPrimitive, S];
export type AnySerialIterator<SI extends SerialIterType = SerialIterType> = AsyncIterator<SI> | Iterator<SI>;

export interface SerializedIterableProxy {
	id: string;
}

export interface SerializedIteratorResult<S extends Serialized = Serialized> {
	id: string;
	result: S | [SerialPrimitive, S] | undefined;
	done: boolean;
}
